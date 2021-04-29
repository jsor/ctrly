/*!
 * ctrly v0.7.0
 * Copyright (c) 2018-2021 Jan Sorgalla
 * License: MIT
 */
function activeElement() {
  try {
    var _document = document,
        _activeElement = _document.activeElement;
    return _activeElement && _activeElement.nodeName ? _activeElement : document.body;
  } catch (_) {
    return document.body;
  }
}

function parents(element) {
  var list = [];
  while (element && element.parentNode && element.parentNode.nodeType === 1) {
    element = element.parentNode;
    list.push(element);
  }
  return list;
}

function scrollPositionRestorer(element) {
  var positions = parents(element).map(function (parent) {
    return [parent, parent.scrollTop, parent.scrollLeft];
  });
  return function () {
    positions.forEach(function (cache) {
      cache[0].scrollTop = cache[1];
      cache[0].scrollLeft = cache[2];
    });
  };
}

function focus(element) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      restoreScrollPosition = _ref.restoreScrollPosition;
  var restorer;
  if (restoreScrollPosition) {
    restorer = scrollPositionRestorer(element);
  }
  try {
    element.focus();
  } catch (_) {
  }
  if (restorer) {
    restorer();
  }
}

function matches(element, selector) {
  if (!element) {
    return false;
  }
  var nativeMatches = element.matches || element.webkitMatchesSelector || element.msMatchesSelector;
  if (typeof nativeMatches !== 'function') {
    return false;
  }
  return nativeMatches.call(element, selector);
}

function closest(element, selector) {
  if (!element) {
    return null;
  }
  if (typeof element.closest === 'function') {
    return element.closest(selector);
  }
  do {
    if (matches(element, selector)) {
      return element;
    }
    element = element.parentNode;
  } while (element && element.nodeType === 1);
  return null;
}

function selectAll(context, selector) {
  if (!context || typeof context.querySelectorAll !== 'function') {
    return [];
  }
  return [].slice.call(context.querySelectorAll(selector));
}

var selector = ['a[href]',
'area[href]', 'input', 'select', 'textarea', 'button', 'iframe', 'object', 'audio[controls]', 'video[controls]', '[contenteditable]', '[tabindex]'].join(',');
var inputNodeNameRegexp = /^(input|select|textarea|button|object)$/;
function focusableFilter(element) {
  var nodeName = element.nodeName.toLowerCase();
  if (nodeName === 'area') {
    return isValidArea(element);
  }
  if (element.disabled) {
    return false;
  }
  if (inputNodeNameRegexp.test(nodeName)) {
    var fieldset = closest(element, 'fieldset');
    if (fieldset && fieldset.disabled) {
      return false;
    }
  }
  return visible(element);
}
function tabbableFilter(element) {
  var index = tabIndex(element);
  return focusableFilter(element) && index >= 0;
}
function compare(a, b) {
  var aIndex = tabIndex(a, true);
  var bIndex = tabIndex(b, true);
  if (aIndex === bIndex) {
    return a.compareDocumentPosition(b) & 2 ? 1 : -1;
  }
  return aIndex - bIndex;
}
function isValidArea(element) {
  var map = element.parentNode;
  var mapName = map.name;
  if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
    return false;
  }
  var images = selectAll(document, "img[usemap=\"#".concat(mapName, "\"]"));
  return images.length > 0 && visible(images[0]);
}
function visible(element) {
  var style = getComputedStyle(element);
  return (
    style.visibility !== 'hidden' && style.visibility !== 'collapse' && style.display !== 'none' && parents(element).every(function (el) {
      return getComputedStyle(el).display !== 'none';
    })
  );
}
function tabIndex(element) {
  var positiveOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var index = parseInt(element.getAttribute('tabindex'), 10);
  return isNaN(index) ? 0 : positiveOnly && index < 0 ? 0 : index;
}

function isTabbable(element) {
  return matches(element, selector) && tabbableFilter(element);
}

var supportedOptions;
function optionsSupport() {
  if (supportedOptions) {
    return supportedOptions;
  }
  supportedOptions = {
    capture: false,
    once: false,
    passive: false
  };
  var options = {
    get capture() {
      supportedOptions.capture = true;
      return false;
    },
    get once() {
      supportedOptions.once = true;
      return false;
    },
    get passive() {
      supportedOptions.passive = true;
      return false;
    }
  };
  window.addEventListener('test', options, options);
  window.removeEventListener('test', options, options);
  return supportedOptions;
}

function optionsArgument() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _support = optionsSupport(),
      once = _support.once,
      passive = _support.passive,
      capture = _support.capture;
  if (!once && !passive && !capture) {
    return Boolean(options.capture);
  }
  if (!once) {
    delete options.once;
  }
  if (!passive) {
    delete options.passive;
  }
  if (!capture) {
    delete options.capture;
  }
  return options;
}

function off(target, type, listener) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    capture: false
  };
  if (!target || typeof target.removeEventListener !== 'function') {
    return;
  }
  target.removeEventListener(type, listener, optionsArgument(options));
}

function on(target, type, listener) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    capture: false
  };
  if (!target || typeof target.addEventListener !== 'function') {
    return function () {};
  }
  var callback = listener;
  var remove = function remove() {
    off(target, type, callback, options);
  };
  if (options.once && !optionsSupport().once) {
    callback = function callback(event) {
      remove();
      listener.call(target, event);
    };
  }
  target.addEventListener(type, callback, optionsArgument(options));
  return remove;
}

function delegate(target, type, selector, listener) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
    capture: false
  };
  var once = options.once === true;
  delete options.once;
  var remove = on(target, type, function (event) {
    var delegateTarget = closest(event.target, selector);
    if (!delegateTarget) {
      return;
    }
    if (once) {
      remove();
    }
    listener.call(delegateTarget, event, delegateTarget);
  }, options);
  return remove;
}

function dispatch(target, type) {
  var eventInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!target || typeof target.dispatchEvent !== 'function') {
    return true;
  }
  eventInit.bubbles = eventInit.bubbles || false;
  eventInit.cancelable = eventInit.cancelable || false;
  eventInit.composed = eventInit.composed || false;
  eventInit.detail = eventInit.detail || null;
  var event;
  try {
    event = new CustomEvent(type, eventInit);
  } catch (_) {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, eventInit.bubbles, eventInit.cancelable, eventInit.detail);
  }
  return target.dispatchEvent(event);
}

function ready(listener) {
  var state = document.readyState;
  if (state === 'complete' || state === 'interactive') {
    setTimeout(listener, 0);
    return;
  }
  document.addEventListener('DOMContentLoaded', function () {
    listener();
  }, optionsArgument({
    capture: true,
    once: true,
    passive: true
  }));
}

function tabbable(element) {
  return selectAll(arguments.length > 0 ? element : document, selector).filter(tabbableFilter).sort(compare);
}

var defaultOptions = {
  selector: '[data-ctrly]',
  context: null,
  focusTarget: true,
  closeOnBlur: true,
  closeOnEsc: true,
  closeOnOutsideClick: true,
  closeOnScroll: false,
  trapFocus: false,
  allowMultiple: false,
  on: null,
  autoInit: true
};
function settings(options) {
  var extended = {};
  var args = [defaultOptions, options];
  args.forEach(function (arg) {
    for (var prop in arg) {
      if (Object.prototype.hasOwnProperty.call(arg, prop)) {
        extended[prop] = arg[prop];
      }
    }
  });
  return extended;
}
function keyCode(event) {
  return 'which' in event ? event.which : event.keyCode;
}
function findControls(target) {
  return selectAll(document, "[aria-controls=\"".concat(target.id, "\"]"));
}
function findTarget(control) {
  return document.getElementById(control.getAttribute('aria-controls') || control.getAttribute('data-ctrly'));
}
function resetControl(control) {
  control.removeAttribute('aria-pressed');
  control.removeAttribute('aria-controls');
  control.removeAttribute('aria-expanded');
}
var idCounter = 0;
function ctrly() {
  var instanceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = settings(instanceOptions);
  var controlSelector = options.selector;
  var eventListener = options.on || {};
  var instances = {};
  function context(control) {
    if (!options.context) {
      return document;
    }
    return closest(control, options.context);
  }
  function trigger(target, event) {
    if (typeof eventListener[event] === 'function' && eventListener[event](target) === false) {
      return false;
    }
    return dispatch(target, "ctrly:".concat(event), {
      bubbles: true,
      cancelable: true
    }) !== false;
  }
  function findParentTarget(control) {
    var element = control;
    while (element) {
      if (element.id && instances[element.id]) {
        return element;
      }
      element = element.parentElement;
    }
  }
  function close(target) {
    var returnFocus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (!target) {
      return false;
    }
    if (!target.hasAttribute('data-ctrly-opened')) {
      return false;
    }
    if (!trigger(target, 'close')) {
      return false;
    }
    var currentActiveElement = activeElement();
    var _ref = instances[target.id] || {},
        lastActiveElement = _ref.lastActiveElement,
        destroy = _ref.destroy;
    delete instances[target.id];
    if (destroy) {
      destroy();
    }
    findControls(target).forEach(function (c) {
      if (c.tagName.toLowerCase() !== 'button') {
        c.setAttribute('aria-pressed', 'false');
      }
      c.setAttribute('aria-expanded', 'false');
    });
    target.removeAttribute('data-ctrly-opened');
    target.setAttribute('aria-hidden', 'true');
    target.removeAttribute('tabindex');
    target.blur();
    if (returnFocus && lastActiveElement && target.contains(currentActiveElement)) {
      focus(lastActiveElement, {
        restoreScrollPosition: true
      });
    }
    trigger(target, 'closed');
    return target;
  }
  function closeOthers(target) {
    selectAll(context(target), controlSelector).forEach(function (control) {
      var other = findTarget(control);
      if (other && other.id !== target.id) {
        close(other, false);
      }
    });
  }
  function addEventListeners(control, target) {
    var removeFuncs = [];
    if (options.closeOnBlur && !options.trapFocus) {
      removeFuncs.push(on(document, 'focusin', function (event) {
        if (!target.contains(event.target)) {
          setTimeout(function () {
            close(target, false);
          }, 0);
        }
      }, {
        capture: true,
        passive: true
      }));
    }
    if (options.closeOnEsc) {
      removeFuncs.push(on(document, 'keydown', function (event) {
        if (keyCode(event) === 27 && close(target)) {
          event.preventDefault();
        }
      }));
    }
    if (options.closeOnOutsideClick) {
      removeFuncs.push(on(document, 'click', function (event) {
        if (keyCode(event) === 1 && !target.contains(event.target) && !closest(event.target, controlSelector)) {
          close(target);
        }
      }, {
        passive: true
      }));
    }
    if (options.closeOnScroll) {
      var active = false;
      var activate = function activate() {
        active = true;
      };
      var deactivate = function deactivate() {
        active = false;
      };
      removeFuncs.push(on(target, 'mouseenter', activate, {
        passive: true
      }), on(target, 'mouseleave', deactivate, {
        passive: true
      }), on(target, 'touchstart', activate, {
        passive: true
      }), on(target, 'touchend', deactivate, {
        passive: true
      }), on(window, 'scroll', function () {
        if (!active) {
          close(target);
        }
      }, {
        passive: true
      }));
    }
    if (options.trapFocus) {
      removeFuncs.push(on(document, 'keydown', function (event) {
        if (keyCode(event) !== 9) {
          return;
        }
        var tabbableElements = tabbable(target);
        if (!tabbableElements[0]) {
          event.preventDefault();
          focus(target);
          return;
        }
        var active = activeElement();
        var firstTabStop = tabbableElements[0];
        var lastTabStop = tabbableElements[tabbableElements.length - 1];
        if (event.shiftKey && active === firstTabStop) {
          event.preventDefault();
          focus(lastTabStop);
          return;
        }
        if (!event.shiftKey && active === lastTabStop) {
          focus(firstTabStop);
          event.preventDefault();
        }
      }));
    }
    return function () {
      while (removeFuncs.length > 0) {
        removeFuncs.shift().call();
      }
    };
  }
  function open(control) {
    var target = findTarget(control);
    if (!target) {
      resetControl(control);
      return false;
    }
    if (target.hasAttribute('data-ctrly-opened')) {
      return false;
    }
    if (!trigger(target, 'open')) {
      return false;
    }
    instances[target.id] = {
      lastActiveElement: activeElement(),
      destroy: addEventListeners(control, target)
    };
    findControls(target).forEach(function (c) {
      if (c.tagName.toLowerCase() !== 'button') {
        c.setAttribute('aria-pressed', 'true');
      }
      c.setAttribute('aria-expanded', 'true');
    });
    target.setAttribute('data-ctrly-opened', '');
    target.setAttribute('aria-hidden', 'false');
    target.setAttribute('tabindex', '-1');
    trigger(target, 'opened');
    return target;
  }
  function toggle(event, control) {
    var target = findTarget(control);
    if (!target) {
      if (close(findParentTarget(control))) {
        event.preventDefault();
      }
      return;
    }
    if (control.getAttribute('aria-expanded') === 'true') {
      if (close(target)) {
        event.preventDefault();
      }
      return;
    }
    if (!options.allowMultiple) {
      closeOthers(target);
    }
    open(control);
    if (target) {
      event.preventDefault();
      if (options.focusTarget) {
        focus(tabbable(target)[0] || target);
      }
      target.scrollTop = 0;
      target.scrollLeft = 0;
    }
  }
  var removeControlClick;
  var removeControlKeydown;
  function init() {
    if (!removeControlClick) {
      removeControlClick = delegate(document, 'click', controlSelector, function (event, control) {
        if (keyCode(event) === 1
        ) {
            toggle(event, control);
          }
      });
      removeControlKeydown = delegate(document, 'keydown', controlSelector, function (event, control) {
        if (keyCode(event) === 13
        || keyCode(event) === 32
        ) {
            toggle(event, control);
          }
      });
    }
    selectAll(document, controlSelector).forEach(function (control) {
      var target = findTarget(control);
      if (!target) {
        resetControl(control);
        return;
      }
      if (control.tagName.toLowerCase() !== 'button') {
        if (!control.hasAttribute('role')) {
          control.setAttribute('role', 'button');
        }
        if (!isTabbable(control)) {
          control.setAttribute('tabindex', '0');
        }
      }
      control.setAttribute('aria-controls', target.id);
      var labelledBy = findControls(target).map(function (control) {
        if (!control.id) {
          control.setAttribute('id', 'ctrly-control-' + ++idCounter);
        }
        return control.id;
      });
      var newLabelledBy = (target.getAttribute('aria-labelledby') || '').split(' ').concat(labelledBy).filter(function (id, position, array) {
        return id !== '' && array.indexOf(id) === position;
      });
      target.setAttribute('aria-labelledby', newLabelledBy.join(' '));
      if (control.getAttribute('aria-expanded') === 'true' || control.hasAttribute('data-ctrly-open')) {
        open(control);
        return;
      }
      if (control.tagName.toLowerCase() !== 'button') {
        control.setAttribute('aria-pressed', 'false');
      }
      control.setAttribute('aria-expanded', 'false');
      target.setAttribute('aria-hidden', 'true');
      target.removeAttribute('tabindex');
    });
  }
  function reset(fullReset) {
    if (fullReset && removeControlClick) {
      removeControlClick();
      removeControlClick = null;
      removeControlKeydown();
      removeControlKeydown = null;
    }
    selectAll(document, controlSelector).forEach(function (control) {
      if (fullReset) {
        resetControl(control);
      }
      var target = findTarget(control);
      if (target) {
        close(target, false);
        if (fullReset) {
          target.removeAttribute('aria-hidden');
        }
      }
    });
    for (var id in instances) {
      if (Object.prototype.hasOwnProperty.call(instances, id)) {
        instances[id].destroy();
        delete instances[id];
      }
    }
  }
  function closeAll() {
    reset(false);
  }
  function destroy() {
    reset(true);
  }
  if (options.autoInit) {
    ready(init);
  }
  return {
    closeAll: closeAll,
    destroy: destroy,
    init: init
  };
}

export default ctrly;
