export function assertUninitialized(control, target, messagePrefix = '') {
    assert.isFalse(control.hasAttribute('aria-controls'), messagePrefix + 'Uninitialized: aria-controls must not be set');
    assert.isFalse(control.hasAttribute('aria-expanded'), messagePrefix + 'Uninitialized: aria-expanded must not be set');
    assert.isFalse(target.hasAttribute('aria-hidden'), messagePrefix + 'Uninitialized: aria-hidden must not be set');
    assert.isFalse(target.hasAttribute('data-ctrly-opened'), messagePrefix + 'Uninitialized: data-ctrly-opened must not be set');
    assert.isFalse(target.hasAttribute('tabindex'), messagePrefix + 'Uninitialized: tabindex must not be set');
}

export function assertOpen(control, target, messagePrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'true', messagePrefix + 'Open: aria-expanded must be true');
    assert.equal(target.getAttribute('aria-hidden'), 'false', messagePrefix + 'Open: aria-hidden must be false');
    assert.equal(target.getAttribute('data-ctrly-opened'), '', messagePrefix + 'Open: data-ctrly-opened must be set and empty');
    assert.equal(target.getAttribute('tabindex'), '-1', messagePrefix + 'Open: tabindex must be -1');
}

export function assertClosed(control, target, messagePrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'false', messagePrefix + 'Closed: aria-expanded must be false');
    assert.equal(target.getAttribute('aria-hidden'), 'true', messagePrefix + 'Closed: aria-hidden must be true');
    assert.isFalse(target.hasAttribute('data-ctrly-opened'), messagePrefix + 'Closed: data-ctrly-opened must not be set');
    assert.isFalse(target.hasAttribute('tabindex'), messagePrefix + 'Closed: tabindex must not be set');
}

export function triggerCompatFocusEvent(type, target) {
    // Firefox and Opera work unreliable for focus/blur events, so we trigger
    // the event manually.
    // https://github.com/markelog/jquery/blob/master/test/unit/event.js#L2629
    if (
        /firefox/i.test(window.navigator.userAgent) ||
        /Opera|OPR\//i.test(window.navigator.userAgent)
    ) {
        target.dispatchEvent(new FocusEvent(type));
    }
}
