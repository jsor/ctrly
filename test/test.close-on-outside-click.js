import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureDefault} from './fixture';
import {assertOpen, assertClosed} from './helper';

describe('ctrly(closeOnOutsideClick)', () => {
    let fixture;
    let ctrlyInstance;

    beforeEach(() => {
        fixture = fixtureDefault();
    });

    afterEach(() => {
        if (ctrlyInstance) {
            ctrlyInstance.destroy();
        }

        fixture.destroy();
        fixture = null;
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

    it('does not close target on outside click after mouse enters target', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(target, 'mouseenter');

            simulant.fire(document, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            done();
        });
    });

    it('closes target on outside click after mouse leaves target', done => {
        const {control, target} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(target, 'mouseenter');

            simulant.fire(document, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            simulant.fire(target, 'mouseleave');

            simulant.fire(document, 'click', {which: 1, button: 0});

            assertClosed(control, target);

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
