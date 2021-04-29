import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly.js';
import {fixtureDefault} from './fixture.js';
import {assertOpen, assertClosed} from './helper.js';

describe('ctrly(closeOnOutsideClick)', () => {
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

    it('closes target on outside click by default', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(document, 'click', {which: 1, button: 0});

            assertClosed(control, target);

            done();
        });
    });

    it('does not close target on click from within target', done => {
        const {control, target, targetLink} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(targetLink, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('does not close target on outside click when configured', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({closeOnOutsideClick: false});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(document, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });
});
