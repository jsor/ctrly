import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureMultiple} from './fixture';
import {assertClosed, assertOpen} from './helper';

describe('ctrly(allowMultiple)', () => {
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

    it('allows multiple when configured', done => {
        const {control, target, control2, target2} = fixture.refs;

        ctrlyInstance = ctrly({allowMultiple: true, closeOnBlur: false});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            simulant.fire(control2, 'click', {which: 1, button: 0});

            assertOpen(control, target);
            assertOpen(control2, target2);

            done();
        });
    });
});
