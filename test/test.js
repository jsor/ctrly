import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {
    fixtureDefault,
    fixtureExpanded,
    fixtureInvalidAriaControls,
    fixtureInvalidAriaControlsExpanded,
    fixtureMissingAriaControls,
    fixtureMissingAriaControlsExpanded,
    fixtureNonButton
} from './fixture';
import {assertOpen, assertClosed, assertUninitialized} from './helper';

describe('ctrly()', () => {
    let fixture;
    let ctrlyInstance;

    afterEach(() => {
        if (ctrlyInstance) {
            ctrlyInstance.destroy();
            ctrlyInstance = null;
        }

        if (fixture) {
            fixture.destroy();
            fixture = null;
        }
    });

    it('click on control shows target', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('click on control does not show target if right mouse click', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 3, button: 2});

            assertClosed(control, target);

            done();
        });
    });

    it('click on control again hides shown target', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('closes already expanded target', done => {
        fixture = fixtureExpanded();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertOpen(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('closes target if control without target id is inside the target', done => {
        fixture = fixtureDefault();

        const {control, target, targetClose} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(targetClose, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('closes already expanded target if control without target id is inside the target', done => {
        fixture = fixtureExpanded();

        const {control, target, targetClose} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertOpen(control, target);

            simulant.fire(targetClose, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('close works if target removed from DOM', done => {
        fixture = fixtureExpanded();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertOpen(control, target);

            target.parentNode.removeChild(target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            done();
        });
    });

    it('dispatches open event on option callback', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                open: eventTarget => {
                    assert.equal(eventTarget, target);

                    done();
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('does not open target if open option callback returns false', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                open: () => {
                    return false;
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('dispatches open DOM event on control', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:open', e => {
                assert.property(e, 'target');
                assert.equal(e.target, target);

                done();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('does not open target if open DOM event listener calls e.preventDefault()', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:open', e => {
                e.preventDefault();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('dispatches opened event on option callback', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                opened: eventTarget => {
                    assert.equal(eventTarget, target);

                    done();
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('dispatches opened DOM event on control', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:opened', e => {
                assert.property(e, 'target');
                assert.equal(e.target, target);

                done();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('dispatches close event on option callback', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                close: eventTarget => {
                    assert.equal(eventTarget, target);

                    done();
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});
            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('does not close target if close option callback returns false', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                close: () => {
                    return false;
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('dispatches close DOM event on control', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:close', e => {
                assert.property(e, 'target');
                assert.equal(e.target, target);

                done();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});
            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('does not close target if close DOM event listener calls e.preventDefault()', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:close', e => {
                e.preventDefault();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('dispatches closed event on option callback', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({
            on: {
                closed: eventTarget => {
                    assert.equal(eventTarget, target);

                    done();
                }
            }
        });

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});
            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('dispatches closed DOM event on control', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            target.addEventListener('ctrly:closed', e => {
                assert.property(e, 'target');
                assert.equal(e.target, target);

                done();
            });

            simulant.fire(control, 'click', {which: 1, button: 0});
            simulant.fire(control, 'click', {which: 1, button: 0});
        });
    });

    it('removes aria-* attributes on invalid aria-controls', done => {
        fixture = fixtureInvalidAriaControls();

        const {control} = fixture.refs;

        assert(control.hasAttribute('aria-controls'));
        assert.equal(control.getAttribute('aria-expanded'), 'false');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            done();
        });
    });

    it('removes aria-* attributes on invalid expanded aria-controls', done => {
        fixture = fixtureInvalidAriaControlsExpanded();

        const {control} = fixture.refs;

        assert(control.hasAttribute('aria-controls'));
        assert.equal(control.getAttribute('aria-expanded'), 'true');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            done();
        });
    });

    it('removes aria-* attributes on missing aria-controls', done => {
        fixture = fixtureMissingAriaControls();

        const {control} = fixture.refs;

        assert.isFalse(control.hasAttribute('aria-controls'));
        assert.equal(control.getAttribute('aria-expanded'), 'false');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            done();
        });
    });

    it('removes aria-* attributes on missing expanded aria-controls', done => {
        fixture = fixtureMissingAriaControlsExpanded();

        const {control} = fixture.refs;

        assert.isFalse(control.hasAttribute('aria-controls'));
        assert.equal(control.getAttribute('aria-expanded'), 'true');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.isFalse(control.hasAttribute('aria-controls'));
            assert.isFalse(control.hasAttribute('aria-expanded'));

            done();
        });
    });

    it('returns focus to last activeElement after close', done => {
        fixture = fixtureDefault();

        const {control, target, targetClose} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            control.focus();
            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(targetClose, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('closes all targets on closeAll()', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            ctrlyInstance.closeAll();
            ctrlyInstance.closeAll(); // Intentionally call destroy() again

            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('resets elements on destroy()', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            ctrlyInstance.destroy();
            ctrlyInstance.destroy(); // Intentionally call destroy() again
            ctrlyInstance = null;

            assertUninitialized(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertUninitialized(control, target);

            done();
        });
    });

    it('re-initialises elements on init()', done => {
        fixture = fixtureDefault();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            ctrlyInstance.destroy();

            assertUninitialized(control, target);

            ctrlyInstance.init();
            ctrlyInstance.init(); // Intentionally call init() again

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target, 'After re-init ');

            done();
        });
    });

    it('handles non-<button> elements', done => {
        fixture = fixtureNonButton();

        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assert.equal(control.getAttribute('role'), 'button');
            assert.equal(control.getAttribute('tabindex'), '0');

            assertClosed(control, target);
            assert.equal(control.getAttribute('aria-pressed'), 'false', 'Closed: aria-pressed must be false');

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);
            assert.equal(control.getAttribute('aria-pressed'), 'true', 'Open: aria-pressed must be true');

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            simulant.fire(control, 'keydown', {which: 32, button: 0});

            assertOpen(control, target);

            simulant.fire(control, 'keydown', {which: 13, button: 0});

            assertClosed(control, target);

            done();
        });
    });
});
