import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {
    fixtureDefault,
    fixtureExpanded,
    fixtureInvalidAriaControls,
    fixtureInvalidAriaControlsExpanded,
    fixtureMissingAriaControls,
    fixtureMissingAriaControlsExpanded
} from './fixture';
import {assertOpen, assertClosed} from './helper';

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

    it('does nothing on invalid aria-controls', done => {
        fixture = fixtureInvalidAriaControls();

        const {control} = fixture.refs;

        assert.equal(control.getAttribute('aria-expanded'), 'false');

        ctrlyInstance = ctrly();

        ready(() => {
            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.equal(control.getAttribute('aria-expanded'), 'false');

            done();
        });
    });

    it('sets aria-expanded="false" on invalid expanded aria-controls', done => {
        fixture = fixtureInvalidAriaControlsExpanded();

        const {control} = fixture.refs;

        assert.equal(control.getAttribute('aria-expanded'), 'true');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.equal(control.getAttribute('aria-expanded'), 'false');

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.equal(control.getAttribute('aria-expanded'), 'false');

            done();
        });
    });

    it('does nothing on missing aria-controls', done => {
        fixture = fixtureMissingAriaControls();

        const {control} = fixture.refs;

        assert.equal(control.getAttribute('aria-expanded'), 'false');

        ctrlyInstance = ctrly();

        ready(() => {
            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.equal(control.getAttribute('aria-expanded'), 'false');

            done();
        });
    });

    it('sets aria-expanded="false" on missing expanded aria-controls', done => {
        fixture = fixtureMissingAriaControlsExpanded();

        const {control} = fixture.refs;

        assert.equal(control.getAttribute('aria-expanded'), 'true');

        ctrlyInstance = ctrly();

        ready(() => {
            assert.equal(control.getAttribute('aria-expanded'), 'false');

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.equal(control.getAttribute('aria-expanded'), 'false');

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

            assertClosed(control, target);

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

            assertClosed(control, target);

            ctrlyInstance.init();
            ctrlyInstance.init(); // Intentionally call init() again

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });
});
