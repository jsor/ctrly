import {
    activeElement,
    closest,
    delegate,
    dispatch,
    find,
    focus,
    on,
    ready,
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

function settings(opts) {
    const extended = {};
    const args = [defaultOptions, opts];

    args.forEach(arg => {
        for (const prop in arg) {
            if (Object.prototype.hasOwnProperty.call(arg, prop)) {
                extended[prop] = arg[prop];
            }
        }
    });

    return extended;
}

function keyCode(e) {
    return 'which' in e ? e.which : e.keyCode;
}

function findControls(target) {
    return find(`[aria-controls="${target.id}"]`);
}

function findTarget(control) {
    return document.getElementById(
        control.getAttribute('aria-controls') || control.getAttribute('data-ctrly')
    );
}

function resetControl(control) {
    control.removeAttribute('aria-controls');
    control.removeAttribute('aria-expanded');
}

let idCounter = 0;

export default function ctrly(opts = {}) {
    const options = settings(opts);

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
        find(controlSelector, context(target)).forEach(control => {
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
                on(document, 'focusin', e => {
                    if (!target.contains(e.target)) {
                        close(target, false);
                    }
                }, {capture: true, passive: true})
            );
        }

        if (options.closeOnEsc) {
            removeFuncs.push(
                on(document, 'keydown', e => {
                    if (keyCode(e) === 27 && close(target)) {
                        e.preventDefault();
                    }
                })
            );
        }

        if (options.closeOnOutsideClick) {
            removeFuncs.push(
                on(document, 'click', e => {
                    // Close only after click on document
                    // - if it's a left button mouse click
                    // - if currently not interacting with the target
                    // - if the click did not originated from (within) a control
                    if (
                        keyCode(e) === 1 &&
                        !target.contains(e.target) &&
                        !closest(e.target, controlSelector)
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
                on(document, 'keydown', e => {
                    if (keyCode(e) !== 9) {
                        return;
                    }

                    const tabbableElements = tabbable(target);

                    if (!tabbableElements[0]) {
                        e.preventDefault();
                        focus(target);
                        return;
                    }

                    const active = activeElement();
                    const firstTabStop = tabbableElements[0];
                    const lastTabStop = tabbableElements[tabbableElements.length - 1];

                    if (e.shiftKey && active === firstTabStop) {
                        e.preventDefault();
                        focus(lastTabStop);
                        return;
                    }

                    if (!e.shiftKey && active === lastTabStop) {
                        focus(firstTabStop);
                        e.preventDefault();
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
            c.setAttribute('aria-expanded', 'true');
        });

        target.setAttribute('data-ctrly-opened', '');

        target.setAttribute('aria-hidden', 'false');
        target.setAttribute('tabindex', '-1');

        trigger(target, 'opened');

        return target;
    }

    let removeControlClick;

    function init() {
        if (!removeControlClick) {
            removeControlClick = delegate(document, 'click', controlSelector, (e, control) => {
                if (keyCode(e) !== 1) {
                    return;
                }

                const target = findTarget(control);

                if (!target) {
                    // Allow controls without a value for data-ctrly
                    // to close a target if it's a child element
                    if (close(findParentTarget(control))) {
                        e.preventDefault();
                    }

                    return;
                }

                if (control.getAttribute('aria-expanded') === 'true') {
                    if (close(target)) {
                        e.preventDefault();
                    }

                    return;
                }

                if (!options.allowMultiple) {
                    closeOthers(target);
                }

                open(control);

                if (target) {
                    e.preventDefault();

                    if (options.focusTarget) {
                        focus(
                            tabbable(target)[0] || target
                        );
                    }

                    // Reset scrolling after focusing
                    target.scrollTop = 0;
                    target.scrollLeft = 0;
                }
            });
        }

        find(controlSelector).forEach(control => {
            const target = findTarget(control);

            if (!target) {
                resetControl(control);
                return;
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
                .filter((id, pos, arr) => {
                    return id !== '' && arr.indexOf(id) === pos;
                });

            target.setAttribute('aria-labelledby', newLabelledBy.join(' '));

            if (
                control.getAttribute('aria-expanded') === 'true' ||
                control.hasAttribute('data-ctrly-open')
            ) {
                open(control);
                return;
            }

            control.setAttribute('aria-expanded', 'false');
            target.setAttribute('aria-hidden', 'true');
            target.removeAttribute('tabindex');
        });
    }

    function destroy() {
        if (removeControlClick) {
            removeControlClick();
            removeControlClick = null;
        }

        find(controlSelector).forEach(control => {
            resetControl(control);

            const target = findTarget(control);

            if (target) {
                close(target, false);
                target.removeAttribute('aria-hidden');
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

    if (options.autoInit) {
        ready(init);
    }

    return {init, destroy};
}
