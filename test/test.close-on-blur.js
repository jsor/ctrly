import simulant from 'simulant';
import {ready} from 'domestique';
import ctrly from '../src/ctrly.js';
import {fixtureDefault} from './fixture.js';
import {assertOpen, assertClosed, triggerCompatFocusEvent} from './helper.js';

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

            triggerCompatFocusEvent('focusin', focusableAfter);

            // Closing on blur is delayed...
            setTimeout(() => {
                assertClosed(control, target);

                done();
            }, 100);
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

            triggerCompatFocusEvent('focusin', focusableAfter);

            // Closing on blur is delayed...
            setTimeout(() => {
                assertOpen(control, target);

                done();
            }, 100);
        });
    });
});
