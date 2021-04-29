import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly.js';
import {fixtureDefault} from './fixture.js';
import {assertOpen, assertClosed} from './helper.js';

describe('ctrly(closeOnScroll)', () => {
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

    it('does not close target on scroll by default', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(window, 'scroll');

            assertOpen(control, target);

            done();
        });
    });

    it('closes target on scroll when configured', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({closeOnScroll: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(window, 'scroll');

            assertClosed(control, target);

            done();
        });
    });

    it('does not close target on scroll when configured after mouse enters target', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({closeOnScroll: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(target, 'mouseenter');

            simulant.fire(window, 'scroll');

            assertOpen(control, target);

            simulant.fire(target, 'mouseleave');

            assertOpen(control, target);

            done();
        });
    });
});
