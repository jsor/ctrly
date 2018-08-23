import {render} from 'domestique';

export function fixture(html) {
    const refs = render(`<div id="ctrly-fixture" ref="root">${html}</div>`);

    document.body.appendChild(refs.root);

    return {
        refs,
        destroy: () => {
            document.body.removeChild(refs.root);

            refs.root.textContent = '';
            delete refs.root;

            document.body.scrollTop = 0;
            document.body.scrollLeft = 0;

            document.body.focus();
        }
    };
}

export function fixtureDefault() {
    return fixture(`
<button ref="focusableBefore">Focusable Before</button>
<button ref="control" data-ctrly="target">Toggle</button>
<section ref="target" id="target">
    <button ref="targetClose" data-ctrly="target">Close</button>
    Hello!
    <a ref="targetLink" href="#">Link</a>
</section>
<button ref="focusableAfter">Focusable After</button>
    `);
}

export function fixtureExpanded() {
    return fixture(`
<button ref="control" data-ctrly="target" data-ctrly-open>Toggle</button>
<section ref="target" id="target">
    <button ref="targetClose" data-ctrly="target" data-ctrly-open>Close</button>
    Hello!
    <a ref="targetLink" href="#">Link</a>
</section>
    `);
}

export function fixtureMultiple() {
    return fixture(`
<div class="context">
    <button ref="control" data-ctrly="target">Toggle</button>
    <section ref="target" id="target">
        <button ref="targetClose" data-ctrly="target">Close</button>
        Hello!
        <a ref="targetLink" href="#">Link</a>
    </section>
</div>
<div class="context">
    <button ref="control2" data-ctrly="target2">Toggle</button>
    <section ref="target2" id="target2">
        <button ref="targetClose2" data-ctrly="target2">Close</button>
        Hello!
        <a ref="targetLink2" href="#">Link</a>
    </section>
</div>
    `);
}

export function fixtureInvalidAriaControls() {
    return fixture(`<button data-ctrly ref="control" aria-controls="invalid-target" aria-expanded="false">Toggle</button>`);
}

export function fixtureInvalidAriaControlsExpanded() {
    return fixture(`<button data-ctrly ref="control" aria-controls="invalid-target" aria-expanded="true">Toggle</button>`);
}

export function fixtureMissingAriaControls() {
    return fixture(`<button data-ctrly ref="control" aria-expanded="false">Toggle</button>`);
}

export function fixtureMissingAriaControlsExpanded() {
    return fixture(`<button data-ctrly ref="control" aria-expanded="true">Toggle</button>`);
}
