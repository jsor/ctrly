import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureDefault} from './fixture';
import {assertClosed, assertOpen} from './helper';

describe('ctrly(closeOnEsc)', () => {
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

    it('closes target on ESC by default', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(document, 'keydown', {which: 27});

            assertClosed(control, target);

            done();
        });
    });

    it('does not close target on ESC when configured', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly({closeOnEsc: false});

        ready(() => {
            assertClosed(control, target, '1. assertClosed');

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target, '2. assertOpen');

            simulant.fire(document, 'keydown', {which: 27});

            assertOpen(control, target, '3. assertOpen');

            done();
        });
    });
});
