/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

import { Transport } from "./transport";
import { Remote } from "./remote";
import { Prefetch } from "./prefetch";
import { SearchIndex } from "./search_index";
import { parse as oParser } from "./options_parser";
import { tokenizers } from "./tokenizers";
import { noop } from "../common/utils";

class Bloodhound {
  constructor(o) {
    o = oParser(o);

    this.sorter = o.sorter;
    this.identify = o.identify;
    this.sufficient = o.sufficient;
    this.indexRemote = o.indexRemote;

    this.local = o.local;
    this.remote = o.remote ? new Remote(o.remote) : null;
    this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;

    // the backing data structure used for fast pattern matching
    this.index = new SearchIndex({
      identify: this.identify,
      datumTokenizer: o.datumTokenizer,
      queryTokenizer: o.queryTokenizer
    });

    // hold off on initialization if the initialize option was explicitly false
    o.initialize !== false && this.initialize();
  }

  static noConflict() {
    window && (window.Bloodhound = old);
    return Bloodhound;
  }

  static tokenizers = tokenizers;

  #ttAdapter() {
    if(this.remote) {
      return (query, sync, async) => this.search(query, sync, async);
    } else {
      return (query, sync) => this.search(query, sync);
    }
  }

  #loadPrefetch() {
    const deferred = $.Deferred();
    let serialized;

    if (!this.prefetch) {
      deferred.resolve();
    }

    else if (serialized = this.prefetch.fromCache()) {
      this.index.bootstrap(serialized);
      deferred.resolve();
    }

    else {
      this.prefetch.fromNetwork((err, data) => {
        if (err) { return deferred.reject(); }

        this.add(data);
        this.prefetch.store(this.index.serialize());
        deferred.resolve();
      });
    }

    return deferred.promise();
  }

  #initialize() {
    const that = this;

    // in case this is a reinitialization, clear previous data
    this.clear();

    this.initPromise = this.#loadPrefetch();
    // local must be added to index after prefetch
    this.initPromise.done(() => this.add(this.local));

    return this.initPromise;
  }

  initialize(force) {
    return !this.initPromise || force ? this.#initialize() : this.initPromise;
  }

  // TODO: before initialize what happens?
  add(data) {
    this.index.add(data);
    return this;
  }

  get(ids) {
    ids = _.isArray(ids) ? ids : [].slice.call(arguments);
    return this.index.get(ids);
  }

  search(query, sync, async) {
    const sync = sync || noop;
    const async = async || noop;
    const local = this.sorter(this.index.search(query));

    // return a copy to guarantee no changes within this scope
    // as this array will get used when processing the remote results
    sync(this.remote ? local.slice() : local);

    if (this.remote && local.length < this.sufficient) {
      this.remote.get(query, remote => {
        const nonDuplicates = [];

        // exclude duplicates
        for(const r of remote) {
          if(!local.some(l => this.identify(r) === this.identify(l))) {
            nonDuplicates.push(r);
          }
        }
  
        // #1148: Should Bloodhound index remote datums?
        if(this.indexRemote) {
          this.add(nonDuplicates);
        }

        async(nonDuplicates);
      });
    }

    else if (this.remote) {
      // #149: prevents outdated rate-limited requests from being sent
      this.remote.cancelLastRequest();
    }

    return this;

  }

  all() {
    return this.index.all();
  }

  clear() {
    this.index.reset();
    return this;
  }

  clearPrefetchCache() {
    this.prefetch && this.prefetch.clear();
    return this;
  }

  clearRemoteCache() {
    Transport.resetCache();
    return this;
  }

  // DEPRECATED: will be removed in v1
  ttAdapter() {
    return this.#ttAdapter();
  }
}

export { Bloodhound };