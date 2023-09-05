/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

import { LruCache } from "./lru_cache";

class Transport {
  pendingRequestsCount = 0;
  pendingRequests = {};
  sharedCache = new LruCache(10);

  constructor(o) {
    const o = o || {};

    this.maxPendingRequests = o.maxPendingRequests || 6;
    this.cancelled = false;
    this.lastReq = null;

    this.#send = o.transport;
    this.#get = o.limiter ? o.limiter(this.#get) : this.#get;

    this.#cache = o.cache === false ? new LruCache(0) : sharedCache;
  }

  static setMaxPendingRequests(num) {
    this.maxPendingRequests = num;
  }

  static resetCache() {
    sharedCache.reset();
  }

  #fingerprint(o) {
    o = o || {};
    return o.url + o.type + $.param(o.data || {});
  }

  #getInternal(o, cb) {
    const that = this;
    const fingerprint = this.#fingerprint(o);
    let jqXhr;

    // #149: don't make a network request if there has been a cancellation
    // or if the url doesn't match the last url Transport#get was invoked with
    if (this.cancelled || fingerprint !== this.lastReq) { return; }

    // a request is already in progress, piggyback off of it
    if (jqXhr = pendingRequests[fingerprint]) {
      jqXhr.done(done).fail(fail);
    }

    // under the pending request threshold, so fire off a request
    else if (pendingRequestsCount < this.maxPendingRequests) {
      pendingRequestsCount++;
      pendingRequests[fingerprint] =
        this.#send(o).done(done).fail(fail).always(always);
    }

    // at the pending request threshold, so hang out in the on deck circle
    else {
      this.onDeckRequestArgs = [].slice.call(arguments, 0);
    }

    function done(resp) {
      cb(null, resp);
      that.#cache.set(fingerprint, resp);
    }

    function fail() {
      cb(true);
    }

    function always() {
      pendingRequestsCount--;
      delete pendingRequests[fingerprint];

      // ensures request is always made for the last query
      if (that.onDeckRequestArgs) {
        that.#get.apply(that, that.onDeckRequestArgs);
        that.onDeckRequestArgs = null;
      }
    }
  }

  get(o, cb) {
    var resp, fingerprint;

    cb = cb || $.noop;
    o = _.isString(o) ? { url: o } : (o || {});

    fingerprint = this.#fingerprint(o);

    this.cancelled = false;
    this.lastReq = fingerprint;

    // in-memory cache hit
    if (resp = this.#cache.get(fingerprint)) {
      cb(null, resp);
    }

    // go to network
    else {
      this.#getInternal(o, cb);
    }
  }

  cancel() {
    this.cancelled = true;
  }
}

export { Transport };