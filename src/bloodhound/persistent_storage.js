/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

import { noop, isNumber } from "../common/utils";

function getLocalStorage() {
  let LOCAL_STORAGE;

  try {
    LOCAL_STORAGE = window.localStorage;

    // while in private browsing mode, some browsers make
    // localStorage available, but throw an error when used
    LOCAL_STORAGE.setItem('~~~', '!');
    LOCAL_STORAGE.removeItem('~~~');
  } catch (err) {
    LOCAL_STORAGE = null;
  }
  return LOCAL_STORAGE;
}

  // helper functions
  // ----------------

  function now() {
    return new Date().getTime();
  }

  function encode(val) {
    // convert undefined to null to avoid issues with JSON.parse
    return JSON.stringify(_.isUndefined(val) ? null : val);
  }

  function decode(val) {
    return $.parseJSON(val);
  }

  function gatherMatchingKeys(keyMatcher) {
    var i, key, keys = [], len = LOCAL_STORAGE.length;

    for (i = 0; i < len; i++) {
      if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
        keys.push(key.replace(keyMatcher, ''));
      }
    }

    return keys;
  }

class PersistentStorage {
  constructor(namespace, override) {
    this.prefix = ['__', namespace, '__'].join('');
    this.ttlKey = '__ttl__';
    this.keyMatcher = new RegExp('^' + _.escapeRegExChars(this.prefix));

    // for testing purpose
    this.ls = override || LOCAL_STORAGE;

    // if local storage isn't available, everything becomes a noop
    !this.ls && this.#noop();
  }

  #prefix(key) {
    return this.prefix + key;
  }

  #ttlKey(key) {
    return this.#prefix(key) + this.ttlKey;
  }

  #noop() {
    this.get =
    this.set =
    this.remove =
    this.clear =
    this.isExpired = noop;
  }

  #safeSet(key, val) {
    try {
      this.ls.setItem(key, val);
    } catch (err) {
      // hit the localstorage limit so clean up and better luck next time
      if (err.name === 'QuotaExceededError') {
        this.clear();
        this.#noop();
      }
    }
  }

  get(key) {
    if (this.isExpired(key)) {
      this.remove(key);
    }

    return decode(this.ls.getItem(this.#prefix(key)));
  }

  set(key, val, ttl) {
    if (isNumber(ttl)) {
      this.#safeSet(this.#ttlKey(key), encode(now() + ttl));
    }

    else {
      this.ls.removeItem(this.#ttlKey(key));
    }

    return this.#safeSet(this.#prefix(key), encode(val));
  }

  remove(key) {
    this.ls.removeItem(this.#ttlKey(key));
    this.ls.removeItem(this.#prefix(key));

    return this;
  }

  clear() {
    var i, keys = gatherMatchingKeys(this.keyMatcher);

    for (i = keys.length; i--;) {
      this.remove(keys[i]);
    }

    return this;
  }

  isExpired(key) {
    const ttl = decode(this.ls.getItem(this.#ttlKey(key)));

    return isNumber(ttl) && now() > ttl ? true : false;
  }
}

export { PersistentStorage };