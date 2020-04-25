import simulant from 'simulant';
import {find, on, ready} from 'domestique';
import ctrly from '../src/ctrly';
import {fixtureDefault} from './fixture';
import {assertOpen, assertClosed} from './helper';

const focusableElementsSelector = 'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[contenteditable],[tabindex]:not([tabindex^="-"])';

function addTabListener() {
    return on(document, 'keydown', event => {
        if (event.which === 9 && !event.defaultPrevented) {
            const focusableElements = find(focusableElementsSelector);
            const currentIndex = focusableElements.indexOf(document.activeElement);

            if (event.shiftKey) {
                focusableElements[currentIndex - 1].focus();
            } else {
                focusableElements[currentIndex + 1].focus();
            }

            event.preventDefault();
        }
    });
}

describe('ctrly(trapFocus)', () => {
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

    it('does not trap focus by default', done => {
        const {control, target, targetLink, focusableAfter} = fixture.refs;

        ctrlyInstance = ctrly();

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            const lastFocusableInTarget = targetLink;
            lastFocusableInTarget.focus();

            assert.equal(lastFocusableInTarget, document.activeElement);

            simulant.fire(document, 'keydown', {which: 9});

            assert.equal(document.activeElement, focusableAfter);

            removeTabListener();

            done();
        });
    });

    it('does not trap focus for other keys than TAB', done => {
        const {control, target, targetLink} = fixture.refs;

        ctrlyInstance = ctrly({trapFocus: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            targetLink.focus();

            assert.equal(targetLink, document.activeElement);

            simulant.fire(document, 'keydown', {which: 8});

            assert.equal(document.activeElement, targetLink);

            removeTabListener();

            done();
        });
    });

    it('traps focus for TAB if configured', done => {
        const {control, target, targetLink, targetClose} = fixture.refs;

        ctrlyInstance = ctrly({trapFocus: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            targetLink.focus();

            assert.equal(targetLink, document.activeElement);

            simulant.fire(document, 'keydown', {which: 9});

            assert.equal(document.activeElement, targetClose);

            removeTabListener();

            done();
        });
    });

    it('traps focus for SHIFT+TAB if configured', done => {
        const {control, target, targetLink, targetClose} = fixture.refs;

        ctrlyInstance = ctrly({trapFocus: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            targetClose.focus();

            assert.equal(targetClose, document.activeElement);

            simulant.fire(document, 'keydown', {which: 9, shiftKey: true});

            assert.equal(document.activeElement, targetLink);

            removeTabListener();

            done();
        });
    });

    it('allows normal tabbing inside the target', done => {
        const {control, target, targetLink, targetClose} = fixture.refs;

        ctrlyInstance = ctrly({trapFocus: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            targetClose.focus();

            assert.equal(targetClose, document.activeElement);

            simulant.fire(document, 'keydown', {which: 9});

            assert.equal(document.activeElement, targetLink);

            removeTabListener();

            done();
        });
    });

    it('keeps focus on target root if no focusable elements available', done => {
        const {control, target} = fixture.refs;

        target.innerHTML = '';

        ctrlyInstance = ctrly({trapFocus: true});

        ready(() => {
            assertClosed(control, target);

            simulant.fire(control, 'click', {which: 1, button: 0});

            assertOpen(control, target);

            const removeTabListener = addTabListener();

            target.focus();

            assert.equal(target, document.activeElement);

            simulant.fire(document, 'keydown', {which: 9});

            assert.equal(document.activeElement, target);

            removeTabListener();

            done();
        });
    });
});
