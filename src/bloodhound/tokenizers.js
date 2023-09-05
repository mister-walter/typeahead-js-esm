/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */


function whitespace(str) {
  const str = _.toStr(str);
  return str ? str.split(/\s+/) : [];
}

function nonword(str) {
  const str = _.toStr(str);
  return str ? str.split(/\W+/) : [];
}

function ngram(str) {
  const str = _.toStr(str);

  const tokens = [];
  let word = '';

  for(const char of str.split('')) {
    if (char.match(/\s+/)) {
      word = '';
    } else {
      tokens.push(word + char);
      word += char;
    }
  }

  return tokens;
}

function getObjTokenizer(tokenizer) {
  return function setKey(keys) {
    const keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);

    return function tokenize(o) {
      let tokens = [];

      for(const k of keys) {
        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
      }

      return tokens;
    };
  };
}

const tokenizers = {
  nonword: getObjTokenizer(nonword),
  whitespace: getObjTokenizer(whitespace),
  ngram: getObjTokenizer(ngram)
};

export { tokenizers };
