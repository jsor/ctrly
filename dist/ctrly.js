/*!
 * ctrly v0.1.0 (2018-08-21)
 * Copyright (c) 2018 Jan Sorgalla
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ctrly = factory());
}(this, (function () { 'use strict';

    function activeElement() {
      try {
        var _document = document,
            _activeElement = _document.activeElement;
        return _activeElement && _activeElement.nodeName ? _activeElement : document.body;
      } catch (e) {
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
      var positions = parents(element).map(function (element) {
        return {
          element: element,
          top: element.scrollTop,
          left: element.scrollLeft
        };
      });
      return function () {
        positions.forEach(function (_ref) {
          var element = _ref.element,
              top = _ref.top,
              left = _ref.left;
          element.scrollTop = top;
          element.scrollLeft = left;
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
      } catch (e) {
      }
      if (restorer) {
        restorer();
      }
    }

    function find(selector, element) {
      var context = arguments.length > 1 ? element : document;
      if (!context || typeof context.querySelectorAll !== 'function') {
        return [];
      }
      return [].slice.call(context.querySelectorAll(selector));
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
      } catch (err) {
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

    var defaultOptions = {
      selector: '[data-ctrly]',
      context: null,
      focusTarget: true,
      closeOnEsc: true,
      closeOnOutsideClick: true,
      closeOnScroll: false,
      constrainFocus: false,
      allowMultiple: false,
      on: null
    };
    var focusableElementsSelector = 'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[contenteditable],[tabindex]:not([tabindex^="-"])';
    var passiveEventOptions = {
      passive: true
    };
    function settings(opts) {
      var extended = {};
      var args = [defaultOptions, opts];
      args.forEach(function (arg) {
        for (var prop in arg) {
          if (Object.prototype.hasOwnProperty.call(arg, prop)) {
            extended[prop] = arg[prop];
          }
        }
      });
      return extended;
    }
    function keyCode(e) {
      return 'which' in e ? e.which : e.keyCode;
    }
    function findTarget(control) {
      var targetId = control.getAttribute('aria-controls');
      return document.getElementById(targetId);
    }
    function ctrly() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = settings(opts);
      var controlSelector = options.selector;
      var eventListener = options.on || {};
      var removers = {};
      function context(control) {
        if (!options.context) {
          return document;
        }
        return closest(control, options.context);
      }
      function trigger(target, event) {
        if (typeof eventListener[event] === 'function') {
          if (eventListener[event](target) === false) {
            return false;
          }
        }
        return dispatch(target, "ctrly:".concat(event), {
          bubbles: true,
          cancelable: true
        }) !== false;
      }
      function close(control) {
        var returnFocus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var target = findTarget(control);
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
        if (removers[target.id]) {
          removers[target.id]();
          delete removers[target.id];
        }
        find("[aria-controls=\"".concat(target.id, "\"]")).forEach(function (c) {
          c.setAttribute('aria-expanded', 'false');
        });
        target.removeAttribute('data-ctrly-opened');
        target.setAttribute('aria-hidden', 'true');
        target.removeAttribute('tabindex');
        target.blur();
        if (returnFocus && target.contains(currentActiveElement)) {
          focus(control, {
            restoreScrollPosition: true
          });
        }
        trigger(target, 'closed');
        return target;
      }
      function closeOthers(control) {
        find(controlSelector, context(control)).forEach(function (other) {
          if (other !== control) {
            close(other, false);
          }
        });
      }
      function addEventListeners(control, target) {
        var removeFuncs = [];
        var active = false;
        var activate = function activate() {
          active = true;
        };
        var deactivate = function deactivate() {
          active = false;
        };
        if (options.closeOnOutsideClick || options.closeOnScroll) {
          removeFuncs.push(on(target, 'mouseenter', activate, passiveEventOptions));
          removeFuncs.push(on(target, 'mouseleave', deactivate, passiveEventOptions));
          removeFuncs.push(on(target, 'touchstart', activate, passiveEventOptions));
          removeFuncs.push(on(target, 'touchend', deactivate, passiveEventOptions));
        }
        if (options.closeOnEsc) {
          removeFuncs.push(on(document, 'keydown', function (e) {
            if (keyCode(e) === 27 && close(control)) {
              e.preventDefault();
            }
          }));
        }
        if (options.closeOnOutsideClick) {
          removeFuncs.push(on(document, 'click', function (e) {
            if (!active && keyCode(e) === 1 && !closest(e.target, controlSelector)) {
              close(control);
            }
          }, passiveEventOptions));
        }
        if (options.closeOnScroll) {
          removeFuncs.push(on(window, 'scroll', function () {
            if (!active) {
              close(control);
            }
          }, passiveEventOptions));
        }
        if (options.constrainFocus) {
          removeFuncs.push(on(document, 'keydown', function (e) {
            if (keyCode(e) !== 9) {
              return;
            }
            var focusableElements = find(focusableElementsSelector, target);
            if (!focusableElements[0]) {
              e.preventDefault();
              focus(target);
              return;
            }
            var active = activeElement();
            var firstTabStop = focusableElements[0];
            var lastTabStop = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && active === firstTabStop) {
              e.preventDefault();
              focus(lastTabStop);
              return;
            }
            if (!e.shiftKey && active === lastTabStop) {
              focus(firstTabStop);
              e.preventDefault();
            }
          }));
        }
        return function () {
          while (removeFuncs.length) {
            removeFuncs.shift().call();
          }
        };
      }
      function open(control) {
        var target = findTarget(control);
        if (!target) {
          return false;
        }
        if (target.hasAttribute('data-ctrly-opened')) {
          return false;
        }
        if (!trigger(target, 'open')) {
          return false;
        }
        removers[target.id] = addEventListeners(control, target);
        find("[aria-controls=\"".concat(target.id, "\"]")).forEach(function (c) {
          c.setAttribute('aria-expanded', 'true');
        });
        target.setAttribute('data-ctrly-opened', '');
        target.setAttribute('aria-hidden', 'false');
        target.setAttribute('tabindex', '-1');
        trigger(target, 'opened');
        return target;
      }
      var removeControlClick;
      function init() {
        if (!removeControlClick) {
          removeControlClick = delegate(document, 'click', controlSelector, function (e, control) {
            if (keyCode(e) !== 1) {
              return;
            }
            if (control.getAttribute('aria-expanded') === 'true') {
              if (close(control)) {
                e.preventDefault();
              }
              return;
            }
            if (!options.allowMultiple) {
              closeOthers(control);
            }
            var target = open(control);
            if (target) {
              e.preventDefault();
              if (options.focusTarget) {
                focus(find(focusableElementsSelector, target)[0] || target);
              }
              target.scrollTop = 0;
              target.scrollLeft = 0;
            }
          });
        }
        ready(function () {
          find(controlSelector).forEach(function (control) {
            if (control.getAttribute('aria-expanded') === 'true') {
              open(control);
              return;
            }
            control.setAttribute('aria-expanded', 'false');
            var target = findTarget(control);
            if (target) {
              target.setAttribute('aria-hidden', 'true');
            }
          });
        });
      }
      function destroy() {
        if (removeControlClick) {
          removeControlClick();
          removeControlClick = null;
        }
        find(controlSelector).forEach(function (control) {
          close(control, false);
        });
        for (var id in removers) {
          if (Object.prototype.hasOwnProperty.call(removers, id)) {
            removers[id].call();
          }
        }
      }
      init();
      return {
        init: init,
        destroy: destroy
      };
    }

    return ctrly;

})));
