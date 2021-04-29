import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly.js';
import {fixtureDefault} from './fixture.js';
import {assertClosed, assertOpen} from './helper.js';

describe('ctrly(autoInit)', () => {
    let fixture;
    let ctrlyInstance;

    beforeEach(() => {
        fixture = fixtureDefault();
    });

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

    it('auto initializes by default', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('does not auto initializing when configured', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({autoInit: false});

        ready(() => {
            assert.isFalse(control.hasAttribute('aria-expanded'));
            assert.isFalse(target.hasAttribute('aria-hidden'));
            assert.isFalse(target.hasAttribute('data-ctrly-opened'));
            assert.isFalse(target.hasAttribute('tabindex'));

            simulant.fire(control, 'click', {which: 1, button: 0});

            assert.isFalse(control.hasAttribute('aria-expanded'));
            assert.isFalse(target.hasAttribute('aria-hidden'));
            assert.isFalse(target.hasAttribute('data-ctrly-opened'));
            assert.isFalse(target.hasAttribute('tabindex'));

            done();
        });
    });
});
