/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

class Remote {
  constructor(o) {
    this.url = o.url;
    this.prepare = o.prepare;
    this.transform = o.transform;
    this.indexResponse = o.indexResponse;

    this.transport = new Transport({
      cache: o.cache,
      limiter: o.limiter,
      transport: o.transport,
      maxPendingRequests: o.maxPendingRequests
    });
  }

  #settings() {
    return { url: this.url, type: 'GET', dataType: 'json' };
  }

  get(query, cb) {
    if (!cb) { return; }

    const query = query || '';
    const settings = this.prepare(query, this.#settings());

    return this.transport.get(settings, (err, resp) => {
      if(err) {
        cb([])
      } else {
        cb(this.transform(resp));
      }
    });
  }

  cancelLastRequest() {
    this.transport.cancel();
  }
}

export { Remote };
