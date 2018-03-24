'use strict';

const rgxValidType = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
const typeEndingMatcher = '(?:$|;|\\s)';
const tokenMatcher = "[!#$%&'*+.^_`|~0-9A-Za-z-]+";
const escapeTokenChars = str => str.replace(/[$*+.^|-]/g, '\\$&');

function compileMimeMatch(mimeType) {
  if (Array.isArray(mimeType)) {
    if (mimeType.length > 1) {
      return compileMulti(mimeType.map(normaliazeMimeType));
    }
    mimeType = mimeType[0];
  }

  return compileSingle(normaliazeMimeType(mimeType));
}

function normaliazeMimeType(mimeType) {
  if (typeof mimeType !== 'string') {
    throw new TypeError(`MIME type must be a string. Got '${typeof mimeType}'.`);
  }

  if (mimeType[0] === '+') { // '+suffix' shorthand
    mimeType = '*/*' + mimeType;
  }

  if (!rgxValidType.test(mimeType)) {
    throw new Error('MIME type must be in the "type/subtype" format or the "+suffix" short-form');
  }

  return mimeType;
}

function compileMulti(mimeTypes) {
  const regex = new RegExp(
    '^(?:' + mimeTypes.map(compileRegexString).join('|') + ')' + typeEndingMatcher,
    'i'
  );
  return wrapRegex(regex);
}

function compileSingle(mimeType) {
  const regex = new RegExp('^' + compileRegexString(mimeType) + typeEndingMatcher, 'i');
  return wrapRegex(regex);
}

function compileRegexString(mimeType) {
  let [type, subtype] = mimeType.split('/');

  if (type === '*') {
    type = tokenMatcher;
  } else {
    type = escapeTokenChars(type);
  }

  if (subtype === '*') {
    subtype = tokenMatcher;
  } else if (subtype.startsWith('*+')) {
    subtype = tokenMatcher + escapeTokenChars(subtype.slice(1));
  } else {
    subtype = escapeTokenChars(subtype);
  }

  return type + '/' + subtype;
}

function wrapRegex(regex) {
  return function mimeMatch(mimeType) {
    return regex.test(mimeType);
  };
}

module.exports = compileMimeMatch;
