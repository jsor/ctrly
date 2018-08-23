import {
    activeElement,
    closest,
    delegate,
    dispatch,
    find,
    focus,
    on,
    ready
} from 'domestique';

const defaultOptions = {
    selector: '[data-ctrly]',
    context: null,
    focusTarget: true,
    closeOnEsc: true,
    closeOnOutsideClick: true,
    closeOnScroll: false,
    constrainFocus: false,
    allowMultiple: false,
    on: null
};

const focusableElementsSelector = 'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[contenteditable],[tabindex]:not([tabindex^="-"])';

const passiveEventOptions = {
    passive: true
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

    function close(control, returnFocus = true) {
        const target = findTarget(control);

        if (!target) {
            resetControl(control);
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

        if (instances[target.id]) {
            instances[target.id].destroy();
            delete instances[target.id];
        }

        findControls(target).forEach(c => {
            c.setAttribute('aria-expanded', 'false');
        });

        target.removeAttribute('data-ctrly-opened');

        target.setAttribute('aria-hidden', 'true');
        target.removeAttribute('tabindex');

        target.blur();

        // We return focus only if the current focus is inside this target
        if (returnFocus && target.contains(currentActiveElement)) {
            focus(control, {
                restoreScrollPosition: true
            });
        }

        trigger(target, 'closed');

        return target;
    }

    function closeOthers(control) {
        find(controlSelector, context(control)).forEach(other => {
            if (other !== control) {
                close(other, false);
            }
        });
    }

    function addEventListeners(control, target) {
        const removeFuncs = [];

        let active = false;

        const activate = () => {
            active = true;
        };

        const deactivate = () => {
            active = false;
        };

        if (options.closeOnOutsideClick || options.closeOnScroll) {
            removeFuncs.push(
                on(target, 'mouseenter', activate, passiveEventOptions)
            );
            removeFuncs.push(
                on(target, 'mouseleave', deactivate, passiveEventOptions)
            );
            removeFuncs.push(
                on(target, 'touchstart', activate, passiveEventOptions)
            );
            removeFuncs.push(
                on(target, 'touchend', deactivate, passiveEventOptions)
            );
        }

        if (options.closeOnEsc) {
            removeFuncs.push(
                on(document, 'keydown', e => {
                    if (keyCode(e) === 27 && close(control)) {
                        e.preventDefault();
                    }
                })
            );
        }

        if (options.closeOnOutsideClick) {
            removeFuncs.push(
                on(document, 'click', e => {
                    // Close only after click on document
                    // - if currently not interacting with the target
                    // - if it's a left button mouse click
                    // - if the click did not originated from (within) a control
                    if (!active && keyCode(e) === 1 && !closest(e.target, controlSelector)) {
                        close(control);
                    }
                }, passiveEventOptions)
            );
        }

        if (options.closeOnScroll) {
            removeFuncs.push(
                on(window, 'scroll', () => {
                    if (!active) {
                        close(control);
                    }
                }, passiveEventOptions)
            );
        }

        if (options.constrainFocus) {
            removeFuncs.push(
                on(document, 'keydown', e => {
                    if (keyCode(e) !== 9) {
                        return;
                    }

                    const focusableElements = find(focusableElementsSelector, target);

                    if (!focusableElements[0]) {
                        e.preventDefault();
                        focus(target);
                        return;
                    }

                    const active = activeElement();
                    const firstTabStop = focusableElements[0];
                    const lastTabStop = focusableElements[focusableElements.length - 1];

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

                if (control.getAttribute('aria-expanded') === 'true') {
                    if (close(control)) {
                        e.preventDefault();
                    }

                    return;
                }

                let target = findTarget(control);

                if (!target) {
                    // Allow controls without a value for data-ctrly
                    // to close a target if it's a child element
                    target = findParentTarget(control);
                }

                if (!options.allowMultiple) {
                    closeOthers(control);
                }

                open(control);

                if (target) {
                    e.preventDefault();

                    if (options.focusTarget) {
                        focus(
                            find(focusableElementsSelector, target)[0] || target
                        );
                    }

                    // Reset scrolling after focusing
                    target.scrollTop = 0;
                    target.scrollLeft = 0;
                }
            });
        }

        ready(() => {
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
        });
    }

    function destroy() {
        if (removeControlClick) {
            removeControlClick();
            removeControlClick = null;
        }

        find(controlSelector).forEach(control => {
            close(control, false);
        });

        // Iterate leftover instances
        for (const id in instances) {
            if (Object.prototype.hasOwnProperty.call(instances, id)) {
                instances[id].destroy();
                delete instances[id];
            }
        }
    }

    init();

    return {init, destroy};
}
