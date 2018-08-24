export function assertOpen(control, target, msgPrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'true', msgPrefix + 'Open: aria-expanded must be true');
    assert.equal(target.getAttribute('aria-hidden'), 'false', msgPrefix + 'Open: aria-hidden must be false');
    assert.equal(target.getAttribute('data-ctrly-opened'), '', msgPrefix + 'Open: data-ctrly-opened must be set and empty');
    assert.equal(target.getAttribute('tabindex'), '-1', msgPrefix + 'Open: tabindex must be -1');
}

export function assertClosed(control, target, msgPrefix = '') {
    assert.equal(control.getAttribute('aria-expanded'), 'false', msgPrefix + 'Closed: aria-expanded must be false');
    assert.equal(target.getAttribute('aria-hidden'), 'true', msgPrefix + 'Open: aria-hidden must be true');
    assert.isFalse(target.hasAttribute('data-ctrly-opened'), msgPrefix + 'Open: data-ctrly-opened must not be set');
    assert.isFalse(target.hasAttribute('tabindex'), msgPrefix + 'Open: tabindex must not be set');
}

export function triggerCompatFocusEvent(type, target, relatedTarget) {
    // Firefox and Opera work unreliable for focus/blur events, so we trigger
    // the event manually.
    // https://github.com/markelog/jquery/blob/master/test/unit/event.js#L2629
    if (
        /firefox/i.test(window.navigator.userAgent) ||
        /Opera|OPR\//i.test(window.navigator.userAgent)
    ) {
        // We can't use simulant as it does not support the
        // relatedTarget property.
        // Since this is FF only, we can use FocusEvent()

        const focusEvent = new FocusEvent(type, {
            relatedTarget
        });

        target.dispatchEvent(focusEvent);
    }
}
