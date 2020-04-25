import {
    activeElement,
    closest,
    delegate,
    dispatch,
    focus,
    isTabbable,
    on,
    ready,
    selectAll,
    tabbable
} from 'domestique';

const defaultOptions = {
    selector: '[data-ctrly]',
    context: null,
    focusTarget: true,
    closeOnBlur: true,
    closeOnEsc: true,
    closeOnOutsideClick: true,
    closeOnScroll: false,
    trapFocus: false,
    allowMultiple: false,
    on: null,
    autoInit: true
};

function settings(options) {
    const extended = {};
    const args = [defaultOptions, options];

    args.forEach(arg => {
        for (const prop in arg) {
            if (Object.prototype.hasOwnProperty.call(arg, prop)) {
                extended[prop] = arg[prop];
            }
        }
    });

    return extended;
}

function keyCode(event) {
    return 'which' in event ? event.which : event.keyCode;
}

function findControls(target) {
    return selectAll(document, `[aria-controls="${target.id}"]`);
}

function findTarget(control) {
    return document.getElementById(
        control.getAttribute('aria-controls') || control.getAttribute('data-ctrly')
    );
}

function resetControl(control) {
    control.removeAttribute('aria-pressed');
    control.removeAttribute('aria-controls');
    control.removeAttribute('aria-expanded');
}

let idCounter = 0;

export default function ctrly(instanceOptions = {}) {
    const options = settings(instanceOptions);

    const controlSelector = options.selector;
    const eventListener = options.on || {};

    const instances = {};

    function context(control) {
        if (!options.context) {
            return document;
        }

        return closest(control, options.context);
    }

    function trigger(target, event) {
        if (typeof eventListener[event] === 'function') {
            if (eventListener[event](target) === false) {
                return false;
            }
        }

        return dispatch(target, `ctrly:${event}`, {
            bubbles: true,
            cancelable: true
        }) !== false;
    }

    function findParentTarget(control) {
        let element = control;

        while (element) {
            if (element.id && instances[element.id]) {
                return element;
            }

            element = element.parentElement;
        }
    }

    function close(target, returnFocus = true) {
        if (!target) {
            return false;
        }

        if (!target.hasAttribute('data-ctrly-opened')) {
            return false;
        }

        if (!trigger(target, 'close')) {
            return false;
        }

        // Store reference before we call target.blur()
        const currentActiveElement = activeElement();

        const {lastActiveElement, destroy} = instances[target.id] || {};
        delete instances[target.id];

        if (destroy) {
            destroy();
        }

        findControls(target).forEach(c => {
            if (c.tagName.toLowerCase() !== 'button') {
                c.setAttribute('aria-pressed', 'false');
            }

            c.setAttribute('aria-expanded', 'false');
        });

        target.removeAttribute('data-ctrly-opened');

        target.setAttribute('aria-hidden', 'true');
        target.removeAttribute('tabindex');

        target.blur();

        // We return focus only if the current focus is inside this target
        if (
            returnFocus &&
            lastActiveElement &&
            target.contains(currentActiveElement)
        ) {
            focus(lastActiveElement, {
                restoreScrollPosition: true
            });
        }

        trigger(target, 'closed');

        return target;
    }

    function closeOthers(target) {
        selectAll(context(target), controlSelector).forEach(control => {
            const other = findTarget(control);

            if (other && other.id !== target.id) {
                close(other, false);
            }
        });
    }

    function addEventListeners(control, target) {
        const removeFuncs = [];

        if (options.closeOnBlur && !options.trapFocus) {
            removeFuncs.push(
                on(document, 'focusin', event => {
                    if (!target.contains(event.target)) {
                        // Delay closing target since the "focusin" event is
                        // triggered before the control click handlers.
                        // If focus is shifted to a control by clicking on it,
                        // the click handler must have precedence.
                        setTimeout(() => {
                            close(target, false);
                        }, 0);
                    }
                }, {capture: true, passive: true})
            );
        }

        if (options.closeOnEsc) {
            removeFuncs.push(
                on(document, 'keydown', event => {
                    if (keyCode(event) === 27 && close(target)) {
                        event.preventDefault();
                    }
                })
            );
        }

        if (options.closeOnOutsideClick) {
            removeFuncs.push(
                on(document, 'click', event => {
                    // Close only after click on document
                    // - if it's a left button mouse click
                    // - if currently not interacting with the target
                    // - if the click did not originated from (within) a control
                    if (
                        keyCode(event) === 1 &&
                        !target.contains(event.target) &&
                        !closest(event.target, controlSelector)
                    ) {
                        close(target);
                    }
                }, {passive: true})
            );
        }

        if (options.closeOnScroll) {
            let active = false;

            const activate = () => {
                active = true;
            };

            const deactivate = () => {
                active = false;
            };

            removeFuncs.push(
                on(target, 'mouseenter', activate, {passive: true})
            );
            removeFuncs.push(
                on(target, 'mouseleave', deactivate, {passive: true})
            );
            removeFuncs.push(
                on(target, 'touchstart', activate, {passive: true})
            );
            removeFuncs.push(
                on(target, 'touchend', deactivate, {passive: true})
            );

            removeFuncs.push(
                on(window, 'scroll', () => {
                    if (!active) {
                        close(target);
                    }
                }, {passive: true})
            );
        }

        if (options.trapFocus) {
            removeFuncs.push(
                on(document, 'keydown', event => {
                    if (keyCode(event) !== 9) {
                        return;
                    }

                    const tabbableElements = tabbable(target);

                    if (!tabbableElements[0]) {
                        event.preventDefault();
                        focus(target);
                        return;
                    }

                    const active = activeElement();
                    const firstTabStop = tabbableElements[0];
                    const lastTabStop = tabbableElements[tabbableElements.length - 1];

                    if (event.shiftKey && active === firstTabStop) {
                        event.preventDefault();
                        focus(lastTabStop);
                        return;
                    }

                    if (!event.shiftKey && active === lastTabStop) {
                        focus(firstTabStop);
                        event.preventDefault();
                    }
                })
            );
        }

        return () => {
            while (removeFuncs.length) {
                removeFuncs.shift().call();
            }
        };
    }

    function open(control) {
        const target = findTarget(control);

        if (!target) {
            resetControl(control);
            return false;
        }

        if (target.hasAttribute('data-ctrly-opened')) {
            return false;
        }

        if (!trigger(target, 'open')) {
            return false;
        }

        instances[target.id] = {
            lastActiveElement: activeElement(),
            destroy: addEventListeners(control, target)
        };

        findControls(target).forEach(c => {
            if (c.tagName.toLowerCase() !== 'button') {
                c.setAttribute('aria-pressed', 'true');
            }

            c.setAttribute('aria-expanded', 'true');
        });

        target.setAttribute('data-ctrly-opened', '');

        target.setAttribute('aria-hidden', 'false');
        target.setAttribute('tabindex', '-1');

        trigger(target, 'opened');

        return target;
    }

    function toggle(event, control) {
        const target = findTarget(control);

        if (!target) {
            // Allow controls without a value for data-ctrly
            // to close a target if it's a child element
            if (close(findParentTarget(control))) {
                event.preventDefault();
            }

            return;
        }

        if (control.getAttribute('aria-expanded') === 'true') {
            if (close(target)) {
                event.preventDefault();
            }

            return;
        }

        if (!options.allowMultiple) {
            closeOthers(target);
        }

        open(control);

        if (target) {
            event.preventDefault();

            if (options.focusTarget) {
                focus(
                    tabbable(target)[0] || target
                );
            }

            // Reset scrolling after focusing
            target.scrollTop = 0;
            target.scrollLeft = 0;
        }
    }

    let removeControlClick;
    let removeControlKeydown;

    function init() {
        if (!removeControlClick) {
            removeControlClick = delegate(document, 'click', controlSelector, (event, control) => {
                if (keyCode(event) === 1 /* Left mouse button */) {
                    toggle(event, control);
                }
            });

            removeControlKeydown = delegate(document, 'keydown', controlSelector, (event, control) => {
                if (
                    keyCode(event) === 13 /* Enter */ ||
                    keyCode(event) === 32 /* Space */
                ) {
                    toggle(event, control);
                }
            });
        }

        selectAll(document, controlSelector).forEach(control => {
            const target = findTarget(control);

            if (!target) {
                resetControl(control);
                return;
            }

            if (control.tagName.toLowerCase() !== 'button') {
                if (!control.hasAttribute('role')) {
                    control.setAttribute('role', 'button');
                }

                if (!isTabbable(control)) {
                    control.setAttribute('tabindex', '0');
                }
            }

            control.setAttribute('aria-controls', target.id);

            const labelledBy = findControls(target).map(control => {
                if (!control.id) {
                    control.setAttribute('id', 'ctrly-control-' + ++idCounter);
                }

                return control.id;
            });

            const newLabelledBy = (target.getAttribute('aria-labelledby') || '')
                .split(' ')
                .concat(labelledBy)
                .filter((id, position, array) => {
                    return id !== '' && array.indexOf(id) === position;
                });

            target.setAttribute('aria-labelledby', newLabelledBy.join(' '));

            if (
                control.getAttribute('aria-expanded') === 'true' ||
                control.hasAttribute('data-ctrly-open')
            ) {
                open(control);
                return;
            }

            if (control.tagName.toLowerCase() !== 'button') {
                control.setAttribute('aria-pressed', 'false');
            }

            control.setAttribute('aria-expanded', 'false');
            target.setAttribute('aria-hidden', 'true');
            target.removeAttribute('tabindex');
        });
    }

    function reset(fullReset) {
        if (fullReset && removeControlClick) {
            removeControlClick();
            removeControlClick = null;
            removeControlKeydown();
            removeControlKeydown = null;
        }

        selectAll(document, controlSelector).forEach(control => {
            if (fullReset) {
                resetControl(control);
            }

            const target = findTarget(control);

            if (target) {
                close(target, false);

                if (fullReset) {
                    target.removeAttribute('aria-hidden');
                }
            }
        });

        // Iterate leftover instances
        for (const id in instances) {
            if (Object.prototype.hasOwnProperty.call(instances, id)) {
                instances[id].destroy();
                delete instances[id];
            }
        }
    }

    function closeAll() {
        reset(false);
    }

    function destroy() {
        reset(true);
    }

    if (options.autoInit) {
        ready(init);
    }

    return {
        closeAll,
        destroy,
        init
    };
}
