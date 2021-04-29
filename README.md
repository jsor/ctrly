ctrly
=====

Lightweight and dependency-free content toggling with a focus on accessibility.

[![Build Status](https://travis-ci.com/jsor/ctrly.svg?branch=master)](https://travis-ci.com/jsor/ctrly)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=eDB3b094Y0Jab1dMSnd0M21raWlNUjZzRlZaejlsaEl5T3JEMzFEOWlwUT0tLXVaQmRpdnFOdEp3b3pKY0FlOXpublE9PQ==--d12075170dfb6c636bfd8810bc079a8f9f192803)](https://www.browserstack.com/automate/public-build/eDB3b094Y0Jab1dMSnd0M21raWlNUjZzRlZaejlsaEl5T3JEMzFEOWlwUT0tLXVaQmRpdnFOdEp3b3pKY0FlOXpublE9PQ==--d12075170dfb6c636bfd8810bc079a8f9f192803)

About
-----

ctrly is a lightweight library which tries to solve 80% of the use-cases where
a **control** (usually a `<button>` element) toggles the visibility of a 
**target** element.

It can be used to implement dropdown or off-canvas menus, modals, accordions
and similar UI elements. Example implementations can be found in the 
[`examples/` directory](examples/).

**Demos**: [**Accordion**](https://sorgalla.com/ctrly/examples/accordion/) • [**Dropdown**](https://sorgalla.com/ctrly/examples/dropdown/) • [**Offcanvas**](https://sorgalla.com/ctrly/examples/offcanvas/)

Minified and gzipped, the total footprint weights about 2.8kB.

Installation
------------

The recommended way to install ctrly is via [npm](https://www.npmjs.com/package/ctrly).

```bash
npm install ctrly
```

After installation, `ctrly` can be imported as a module.

```js
import ctrly from 'ctrly';
```

The latest version can also be downloaded or included from 
[unpkg](https://unpkg.com/ctrly) or
[jsDelivr](https://cdn.jsdelivr.net/npm/ctrly).

```html
<script src="/path/to/ctrly.js"></script>
```

The `ctrly()` function is then globally available.

Usage
-----

A typical setup includes a **control** (usually a `<button>` element) which
toggles the visibility of a **target** element.

The control must have a `data-ctrly` attribute which must contain the ID of the
target.

```html
<button data-ctrly="my-target">Toggle</button>
<section id="my-target">You clicked the toggle to make me visible</section>
```

To initialize all controls, the `ctrly()` function must be called once.

```js
ctrly();
```

ctrly then adds all required ARIA attributes:

* The `aria-controls` and `aria-expanded` attributes to the control.
* The `aria-hidden` and `aria-labelledby` to the target.

If the control does not have an `id` attribute, ctrly will add an auto-generated
ID.

The fully generated HTML looks like the following.

```html
<button
    data-ctrly="my-target"
    id="ctrly-control-1"
    aria-controls="my-target"
    aria-expanded="false"
>
    Toggle
</button>
<section
    id="my-target"
    aria-hidden="false"
    aria-labelledby="ctrly-control-1"
>
    You clicked the toggle to make me visible
</section>
```

**Note:** ctrly does not ship with any default CSS which shows and hides the
target element as it makes no assumptions on how the visibility is controlled.

This must be implemented depending on the `aria-hidden` attribute which is
toggled to either `false` or `true` by ctrly.

```css
/* Toggle via the display property */
.target-selector[aria-hidden="true"] {
    display: none;
}

/* Toggle via the visibility property */
.target-selector[aria-hidden="true"] {
    visibility: hidden;
}
```

It is also good practice to hide the controls if JavaScript is disabled.

This can be done depending on the presence of the `aria-controls` attribute
added by ctrly.

```css
.control-selector:not([aria-controls]) {
    display: none;
}
```

While it is highly recommended to use `<button>` elements as controls, ctrly
also supports other HTML elements.

```html
<span data-ctrly="my-target">Toggle</button>
```

The fully generated HTML looks like the following (note the additional 
`tabindex`, `role` and `aria-pressed` attributes).

```html
<span
    data-ctrly="my-target"
    id="ctrly-control-1"
    aria-controls="my-target"
    aria-expanded="false"
    tabindex="0"
    role="button"
    aria-pressed="false"
>
    Toggle
</span>
```

API
---

The return value of the `ctrly()` function is an object with the following 
functions.

* [closeAll](#closeall)
* [destroy](#destroy)
* [init](#init)

### closeAll

This function closes all open targets.

#### Example

```js
const { closeAll } = ctrly();

closeAll();

```

### destroy

This function reverts all elements to their initial state and unbinds all event
listeners.

#### Example

```js
const { destroy } = ctrly();

destroy();

```

### init

This function (re)initializes all controls. This can be useful after the DOM
has been updated, eg. controls have been added dynamically.

#### Example

```js
const { init } = ctrly();

init();

```

Options
-------

ctrly's behavior can be controlled by passing an options object as the first 
argument.

```js
ctrly({
    // Options...
});
```

The following options are available.

* [selector](#selector)
* [context](#context)
* [focusTarget](#focustarget)
* [closeOnBlur](#closeonblur)
* [closeOnEsc](#closeonesc)
* [closeOnOutsideClick](#closeonoutsideclick)
* [closeOnScroll](#closeonscroll)
* [trapFocus](#trapfocus)
* [allowMultiple](#allowmultiple)
* [on](#on)
* [autoInit](#autoinit)

### selector

*Default:* `[data-ctrly]`

A selector for the control elements.

#### Example

```html
<button class="my-control" data-ctrly="my-target">Toggle</button>
```

```js
ctrly({
    selector: '.my-control'
});
```

### context

*Default:* `null`

A selector to group targets together. Can be used in combination with the
[allowMultiple](#allowmultiple) option to allow or disallow multiple open
targets inside a context.

See the [accordion example](examples/accordion/) for a use-case.

#### Example

```html
<div class="my-context">
    <button data-ctrly="my-target">Toggle</button>
</div>
<div class="my-context">
    <button data-ctrly="my-target">Toggle</button>
</div>
```

```js
ctrly({
    context: '.my-context'
});
```

### focusTarget

*Default:* `true`

By default, once the target becomes visible, the focus is shifted to the first
focusable element inside the target. Passing `false` as an option disables this 
behavior.

#### Example

```js
ctrly({
    focusTarget: false
});
```

### closeOnBlur

*Default:* `true`

By default, targets are closed when the focus is shifted from an element inside
the target to an element outside the target. Passing `false` as an option
disables this behavior.

> This setting is always `false` if [`trapFocus`](#trapfocus) is set
  to `true`.

#### Example

```js
ctrly({
    closeOnBlur: false
});
```

### closeOnEsc

*Default:* `true`

By default, targets are closed when the <kbd>ESC</kbd> key is pressed. Passing
`false` as an option disables this behavior.

#### Example

```js
ctrly({
    closeOnEsc: false
});
```

### closeOnOutsideClick

*Default:* `true`

By default, targets are closed when there is a mouse click outside the target.
Passing `false` as an option disables this behavior.

#### Example

```js
ctrly({
    closeOnOutsideClick: false
});
```

### closeOnScroll

*Default:* `false`

Passing `true` as an option closes a target when the window is scrolled and
the mouse is currently not inside the target element.

#### Example

```js
ctrly({
    closeOnScroll: true
});
```

### trapFocus

*Default:* `false`

Passing `true` as an option ensures that <kbd>TAB</kbd> and
<kbd>SHIFT</kbd>+<kbd>TAB</kbd> do not move focus outside the target.

#### Example

```js
ctrly({
    trapFocus: true
});
```

### allowMultiple

*Default:* `false`

By default, if a target becomes visible, all other open targets are closed.
Passing `true` as an option allows multiple targets to be opened at the same 
time.

This can be combined with the [context](#context) option to only allow multiple
open targets inside a context element. 
See the [accordion example](examples/accordion/) for a use-case.

> To allow multiple open targets, [`closeOnBlur`](#closeonblur) must be set to
  `false`.

#### Example

```js
ctrly({
    allowMultiple: true
});
```

### on

*Default:* `{}`

Allows to define event callbacks as `{event: callback}` pairs.

#### Example

```js
ctrly({
    on: {
        open: target => {
            // Called before a target is opened
        },
        opened: target => {
            // Called after a target has been opened
        },
        close: target => {
            // Called before a target is closed
        },
        closed: target => {
            // Called after a target has been closed
        }
    }
});
```

More information about the event callbacks can be found in the
[Events section](#events).

### autoInit

*Default:* `true`

By default, initialization is done when calling `ctrly()`. Passing `false` as
an option disables this behavior and the [`init()`](#init) method must be called
manually.

#### Example

```js
const { init } = ctrly({
    autoInit: false
});

init();
```

Events
------

ctrly triggers several events when a target is opened or closed.

There are 2 ways to bind listeners to the events.

1. Through the [`on` option](#on).
2. Through DOM event listeners on the target element (the DOM event names are
   prefixed with `ctrly:`, eg. `ctrly:open`).

The following events are available.

* [open](#open)
* [opened](#open)
* [close](#close)
* [closed](#closed)

### open

Triggered before the target element is opened.

#### Example

```js
ctrly({
    on: {
        open: target => {
            target.classList.add('is-opening');
        }
    }
});

// or

document.getElementById('my-target').addEventListener('ctrly:open', e => {
    const target = e.target;

    target.classList.add('is-opening');
});
```

### opened

Triggered after the target element has been opened.

#### Example

```js
ctrly({
    on: {
        opened: target => {
            target.classList.remove('is-opening');
        }
    }
});

// or

document.getElementById('my-target').addEventListener('ctrly:opened', e => {
    const target = e.target;

    target.classList.remove('is-opening');
});
```

### close

Triggered before the target element is closed.

#### Example

```js
ctrly({
    on: {
        close: target => {
            target.classList.add('is-closing');
        }
    }
});

// or

document.getElementById('my-target').addEventListener('ctrly:close', e => {
    const target = e.target;

    target.classList.add('is-closing');
});
```

### closed

Triggered after the target element has been opened.

#### Example

```js
ctrly({
    on: {
        closed: target => {
            target.classList.remove('is-closing');
        }
    }
});

// or

document.getElementById('my-target').addEventListener('ctrly:closed', e => {
    const target = e.target;

    target.classList.remove('is-closing');
});
```

Thank You
---------

* [BrowserStack](https://www.browserstack.com/) for providing free VMs for automated testing.
* [GitHub](https://github.com/) for providing free Git repository hosting.
* [npm](https://www.npmjs.com/) for providing the package manager for JavaScript.
* [TravisCI](https://travis-ci.org/) for providing a free build server.

License
-------

Copyright (c) 2018-2021 Jan Sorgalla.
Released under the [MIT](LICENSE) license.
