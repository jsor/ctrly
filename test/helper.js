export function assertUninitialized(control, target, msgPrefix = '') {
    assert.isFalse(control.hasAttribute('aria-controls'), msgPrefix + 'Uninitialized: aria-controls must not be set');
    assert.isFalse(control.hasAttribute('aria-expanded'), msgPrefix + 'Uninitialized: aria-expanded must not be set');
    assert.isFalse(target.hasAttribute('aria-hidden'), msgPrefix + 'Uninitialized: aria-hidden must not be set');
    assert.isFalse(target.hasAttribute('data-ctrly-opened'), msgPrefix + 'Uninitialized: data-ctrly-opened must not be set');
    assert.isFalse(target.hasAttribute('tabindex'), msgPrefix + 'Uninitialized: tabindex must not be set');
}

export function assertOpen(control, target, msgPrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'true', msgPrefix + 'Open: aria-expanded must be true');
    assert.equal(target.getAttribute('aria-hidden'), 'false', msgPrefix + 'Open: aria-hidden must be false');
    assert.equal(target.getAttribute('data-ctrly-opened'), '', msgPrefix + 'Open: data-ctrly-opened must be set and empty');
    assert.equal(target.getAttribute('tabindex'), '-1', msgPrefix + 'Open: tabindex must be -1');
}

export function assertClosed(control, target, msgPrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'false', msgPrefix + 'Closed: aria-expanded must be false');
    assert.equal(target.getAttribute('aria-hidden'), 'true', msgPrefix + 'Closed: aria-hidden must be true');
    assert.isFalse(target.hasAttribute('data-ctrly-opened'), msgPrefix + 'Closed: data-ctrly-opened must not be set');
    assert.isFalse(target.hasAttribute('tabindex'), msgPrefix + 'Closed: tabindex must not be set');
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
