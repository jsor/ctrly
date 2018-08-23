import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureMultiple} from './fixture';
import {assertOpen, assertClosed} from './helper';

describe('ctrly(context)', () => {
    let fixture;
    let ctrlyInstance;

    beforeEach(() => {
        fixture = fixtureMultiple();
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

    it('handles target inside context', done => {
        const {control, target, control2, target2} = fixture.refs;

        ctrlyInstance = ctrly({context: '.context'});

        ready(() => {
            assertClosed(control, target);
            assertClosed(control2, target2);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);
            assertClosed(control2, target2);

            simulant.fire(control2, 'click', {which: 1, button: 0});

            assertOpen(control, target);
            assertOpen(control2, target2);

            done();
        });
    });
});
