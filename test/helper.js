export function assertOpen(control, target, msg) {
    assert.notEqual(control.getAttribute('aria-expanded'), 'false', msg);
    assert.notEqual(target.getAttribute('aria-hidden'), 'true', msg);
}

export function assertClosed(control, target, msg) {
    assert.notEqual(control.getAttribute('aria-expanded'), 'true', msg);
    assert.notEqual(target.getAttribute('aria-hidden'), 'false', msg);
}
