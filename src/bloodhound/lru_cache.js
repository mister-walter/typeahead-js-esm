/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

// inspired by https://github.com/jharding/lru-cache

import { isNumber } from "../common/utils";

class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class List {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(node) {
    if (this.head) {
      node.next = this.head;
      this.head.prev = node;
    }

    this.head = node;
    this.tail = this.tail || node;
  }

  remove(node) {
    node.prev ? node.prev.next = node.next : this.head = node.next;
    node.next ? node.next.prev = node.prev : this.tail = node.prev;
  }

  moveToFront(node) {
    this.remove(node);
    this.add(node);
  }
}

class LruCache {
  constructor(maxSize) {
    this.maxSize = isNumber(maxSize) ? maxSize : 100;
    this.reset();

    // if max size is less than 0, provide a noop cache
    if (this.maxSize <= 0) {
      this.set = this.get = $.noop;
    }
  }

  set(key, val) {
    const tailItem = this.list.tail;
    let node;

    // at capacity
    if (this.size >= this.maxSize) {
      this.list.remove(tailItem);
      delete this.hash[tailItem.key];

      this.size--;
    }

    // writing over existing key
    if (node = this.hash[key]) {
      node.val = val;
      this.list.moveToFront(node);
    }

    // new key
    else {
      node = new Node(key, val);

      this.list.add(node);
      this.hash[key] = node;

      this.size++;
    }
  }

  get(key) {
    const node = this.hash[key];

    if (node) {
      this.list.moveToFront(node);
      return node.val;
    }
  }

  reset() {
    this.size = 0;
    this.hash = {};
    this.list = new List();
  }
}

export { LruCache };