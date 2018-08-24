import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureDefault} from './fixture';
import {assertOpen, assertClosed, triggerCompatFocusEvent} from './helper';

describe('ctrly(closeOnBlur)', () => {
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

    it('closes target when losing focus', done => {
        const {control, target, targetLink, focusableAfter} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            targetLink.focus();

            focusableAfter.focus();

            triggerCompatFocusEvent('focusout', target, focusableAfter);

            assertClosed(control, target);

            done();
        });
    });

    it('does not close target when losing focus when configured', done => {
        const {control, target, targetLink, focusableAfter} = fixture.refs;

        ctrlyInstance = ctrly({closeOnBlur: false});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            targetLink.focus();

            focusableAfter.focus();

            triggerCompatFocusEvent('focusout', target, focusableAfter);

            assertOpen(control, target);

            done();
        });
    });
});
