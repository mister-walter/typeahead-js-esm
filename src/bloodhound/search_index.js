/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

// helper functions
// ----------------

function normalizeTokens(tokens) {
  // filter out falsy tokens
  const tokens = tokens.filter(token => !!token);

  // normalize tokens
  return tokens.map(token => token.toLowerCase());
}

function newNode() {
  const node = {};

  node[IDS] = [];
  node[CHILDREN] = {};

  return node;
}

function unique(array) {
  const seen = new Set();
  const uniques = [];

  for (const elt of array) {
    if (!seen.has(elt)) {
      seen.add(elt);
      uniques.push(elt);
    }
  }

  return uniques;
}

function getIntersection(arrayA, arrayB) {
  let ai = 0;
  let bi = 0;
  const intersection = [];

  arrayA = arrayA.sort();
  arrayB = arrayB.sort();

  const lenArrayA = arrayA.length;
  const lenArrayB = arrayB.length;

  while (ai < lenArrayA && bi < lenArrayB) {
    if (arrayA[ai] < arrayB[bi]) {
      ai++;
    }

    else if (arrayA[ai] > arrayB[bi]) {
      bi++;
    }

    else {
      intersection.push(arrayA[ai]);
      ai++;
      bi++;
    }
  }

  return intersection;
}

class SearchIndex {
  CHILDREN = 'c';
  IDS = 'i';

  constructor(o) {
    o = o || {};

    if (!o.datumTokenizer || !o.queryTokenizer) {
      $.error('datumTokenizer and queryTokenizer are both required');
    }

    this.identify = o.identify || _.stringify;
    this.datumTokenizer = o.datumTokenizer;
    this.queryTokenizer = o.queryTokenizer;
    this.matchAnyQueryToken = o.matchAnyQueryToken;

    this.reset();
  }

  bootstrap(o) {
    this.datums = o.datums;
    this.trie = o.trie;
  }

  add(data) {
    const data = _.isArray(data) ? data : [data];

    for(const datum of data) {
      const id = this.identify(datum);
      const tokens = normalizeTokens(this.datumTokenizer(datum));

      this.datums[id] = datum;

      for(const token of tokens) {
        let node = this.trie;
        const chars = token.split('');
        let ch;

        while (ch = chars.shift()) {
          node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
          node[IDS].push(id);
        }
      }
    }
  }

  get(ids) {
    return ids.map(id => this.datums[id]);
  }

  search(query) {
    const tokens = normalizeTokens(this.queryTokenizer(query));
    let matches;

    for(const token of tokens) {
      let node, chars, ch, ids;

      // previous tokens didn't share any matches
      if (matches && matches.length === 0 && !this.matchAnyQueryToken) {
        return false;
      }

      node = this.trie;
      chars = token.split('');

      while (node && (ch = chars.shift())) {
        node = node[CHILDREN][ch];
      }

      if (node && chars.length === 0) {
        ids = node[IDS].slice(0);
        matches = matches ? getIntersection(matches, ids) : ids;
      }

      // break early if we find out there are no possible matches
      else {
        if (!this.matchAnyQueryToken) {
          matches = [];
          return false;
        }
      }
    }

    return matches ?
      _.map(unique(matches), (id) => this.datums[id]) : [];
  }

  all() {
    const values = [];

    for (const key in this.datums) {
      values.push(this.datums[key]);
    }

    return values;
  }

  reset() {
    this.datums = {};
    this.trie = newNode();
  }

  serialize() {
    return { datums: this.datums, trie: this.trie };
  }
}

export { SearchIndex };
