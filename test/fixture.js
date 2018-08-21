import {render} from 'domestique';

export function fixture(html) {
    function destroy(el) {
        el.parentNode.removeChild(el);
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
        document.body.focus();
    }

    const previous = document.getElementById('ctrly-fixture');

    if (previous) {
        destroy(previous);
    }

    const refs = render(`<div id="ctrly-fixture" ref="root">${html}</div>`);

    document.body.appendChild(refs.root);

    return {
        refs,
        destroy: () => {
            destroy(refs.root);
        }
    };
}

export function fixtureDefault() {
    return fixture(`
<button ref="focusableBefore">Focusable Before</button>
<button data-ctrly ref="control" aria-controls="target" aria-expanded="false">Toggle</button>
<section ref="target" id="target" aria-hidden="true">
    <button ref="targetClose" data-ctrly>Close</button>
    Hello!
    <a ref="targetLink" href="#">Link</a>
</section>
<button ref="focusableAfter">Focusable After</button>
    `);
}

export function fixtureExpanded() {
    return fixture(`
<button data-ctrly ref="control" aria-controls="target" aria-expanded="true">Toggle</button>
<section ref="target" id="target" aria-hidden="false">
    <button ref="targetClose" data-ctrly>Close</button>
    Hello!
    <a ref="targetLink" href="#">Link</a>
</section>
    `);
}

export function fixtureMultiple() {
    return fixture(`
<div class="context">
    <button data-ctrly ref="control" aria-controls="target">Toggle</button>
    <section ref="target" id="target" aria-hidden="false">
        <button ref="targetClose" data-ctrly>Close</button>
        Hello!
        <a ref="targetLink" href="#">Link</a>
    </section>
</div>
<div class="context">
    <button data-ctrly ref="control2" aria-controls="target2">Toggle</button>
    <section ref="target2" id="target2" aria-hidden="false">
        <button ref="targetClose2" data-ctrly>Close</button>
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
