/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

import { PersistentStorage } from "./persistent_storage";

class Prefetch {
  keys = { data: 'data', protocol: 'protocol', thumbprint: 'thumbprint' };

  constructor(o) {
      this.url = o.url;
      this.ttl = o.ttl;
      this.cache = o.cache;
      this.prepare = o.prepare;
      this.transform = o.transform;
      this.transport = o.transport;
      this.thumbprint = o.thumbprint;
  
      this.storage = new PersistentStorage(o.cacheKey);
  }

  #settings() {
    return { url: this.url, type: 'GET', dataType: 'json' };
  }

  store(data) {
    if (!this.cache) { return; }

    this.storage.set(keys.data, data, this.ttl);
    this.storage.set(keys.protocol, location.protocol, this.ttl);
    this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
  }

  fromCache() {
    const stored = {};

    if (!this.cache) { return null; }

    stored.data = this.storage.get(keys.data);
    stored.protocol = this.storage.get(keys.protocol);
    stored.thumbprint = this.storage.get(keys.thumbprint);

    // the stored data is considered expired if the thumbprints
    // don't match or if the protocol it was originally stored under
    // has changed
    const isExpired =
      stored.thumbprint !== this.thumbprint ||
      stored.protocol !== location.protocol;

    // TODO: if expired, remove from local storage

    return stored.data && !isExpired ? stored.data : null;
  }

  fromNetwork(cb) {
    const that = this;

    if (!cb) { return; }

    const settings = this.prepare(this.#settings());
    this.transport(settings).fail(onError).done(onResponse);

    function onError() { cb(true); }
    function onResponse(resp) { cb(null, that.transform(resp)); }
  }

  clear() {
    this.storage.clear();
    return this;
  }
}

export { Prefetch };