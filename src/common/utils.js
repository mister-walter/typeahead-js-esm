/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

function isMsie() {
  // from https://github.com/ded/bowser/blob/master/bowser.js
  return (/(msie|trident)/i).test(navigator.userAgent) ?
    navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
}

function isBlankString(str) { return !str || /^\s*$/.test(str); }

// http://stackoverflow.com/a/6969486
function escapeRegExChars(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function isString(obj) { return typeof obj === 'string'; }

function isNumber(obj) { return typeof obj === 'number'; }

function isArray(obj) { }

function isFunction(obj) { }

function isObject(obj) { }

function isUndefined(obj) { return typeof obj === 'undefined'; }

function isElement(obj) { return !!(obj && obj.nodeType === 1); }

function isJQuery(obj) { return obj instanceof $; }

function toStr(s) {
  return (_.isUndefined(s) || s === null) ? '' : s + '';
}

function bind() { }

// function each(collection, cb) {
//   // stupid argument order for jQuery.each
//   $.each(collection, reverseArgs);

//   function reverseArgs(index, value) { return cb(value, index); }
// }

// function map() { }

// function filter() { }

// function every(obj, test) {
//   var result = true;

//   if (!obj) { return result; }

//   $.each(obj, function (key, val) {
//     if (!(result = test.call(null, val, key, obj))) {
//       return false;
//     }
//   });

//   return !!result;
// }

// function some(obj, test) {
//   var result = false;

//   if (!obj) { return result; }

//   $.each(obj, function (key, val) {
//     if (result = test.call(null, val, key, obj)) {
//       return false;
//     }
//   });

//   return !!result;
// }

function mixin() { }

function identity(x) { return x; }

function clone(obj) { return $.extend(true, {}, obj); }

function getIdGenerator() {
  var counter = 0;
  return function () { return counter++; };
}

function templatify(obj) {
  return $.isFunction(obj) ? obj : template;

  function template() { return String(obj); }
}

function defer(fn) { setTimeout(fn, 0); }

function debounce(func, wait, immediate) {
  var timeout, result;

  return function () {
    var context = this, args = arguments, later, callNow;

    later = function () {
      timeout = null;
      if (!immediate) { result = func.apply(context, args); }
    };

    callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) { result = func.apply(context, args); }

    return result;
  };
}

function throttle(func, wait) {
  var context, args, timeout, result, previous, later;

  previous = 0;
  later = function () {
    previous = new Date();
    timeout = null;
    result = func.apply(context, args);
  };

  return function () {
    var now = new Date(),
      remaining = wait - (now - previous);

    context = this;
    args = arguments;

    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    }

    else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
}

function stringify(val) {
  return _.isString(val) ? val : JSON.stringify(val);
}

function guid() {
  function _p8(s) {
    const p = (Math.random().toString(16) + '000000000').slice(2, 8);
    return s ? '-' + p.slice(0, 4) + '-' + p.slice(4, 4) : p;
  }
  return 'tt-' + _p8() + _p8(true) + _p8(true) + _p8();
}

function noop() { }

export { isNumber, isFunction, mixin, noop, identity, debounce, throttle, stringify, guid, defer, templatify, clone }
