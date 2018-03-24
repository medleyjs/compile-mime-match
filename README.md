# compile-mime-match

[![Build Status](https://travis-ci.org/medleyjs/compile-mime-match.svg?branch=master)](https://travis-ci.org/medleyjs/compile-mime-match)
[![Coverage Status](https://coveralls.io/repos/github/medleyjs/compile-mime-match/badge.svg?branch=master)](https://coveralls.io/github/medleyjs/compile-mime-match?branch=master)

Compiles a function that matches a given MIME type. A faster alternative to [`type-is`](https://www.npmjs.com/package/type-is) for when the MIME type is known ahead of time.

## Installation

```
// npm
npm install compile-mime-match --save

// yarn
yarn add compile-mime-match
```

## Usage

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch('application/json');

mimeMatch('application/json'); // true
mimeMatch('application/json; charset=utf-8'); // true

mimeMatch('text/plain'); // false
```

### Input Formats

#### `type/subtype`

Matches exactly the given MIME type (see the example above).

#### `type/*`

Matches any MIME type will the given `type`.

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch('text/*');

mimeMatch('text/plain'); // true
mimeMatch('text/html'); // true

mimeMatch('image/png'); // false
```

#### `*/subtype`

Matches any MIME type will the given `subtype`.

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch('*/xml');

mimeMatch('application/xml'); // true
mimeMatch('text/xml'); // true

mimeMatch('image/svg+xml'); // false
```

#### `*/*`

Matches any valid MIME type.

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch('*/*');

mimeMatch('image/png'); // true
mimeMatch('application/x-www-form-urlencoded'); // true

mimeMatch('invalid'); // false
mimeMatch('/'); // false
```

#### `+suffix`

Matches any valid MIME type that ends with `+suffix`.

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch('+json');

mimeMatch('application/calendar+json'); // true
mimeMatch('application/geo+json'); // true

mimeMatch('application/json'); // false
mimeMatch('invalid+json'); // false
```

#### Array
  
`compile-mime-match` also accepts an array of strings to match multiple types at the same time:

```js
const compileMimeMatch = require('compile-mime-match');
const mimeMatch = compileMimeMatch(['application/json', 'text/*']);

mimeMatch('application/json'); // true
mimeMatch('application/json; charset=utf-8'); // true
mimeMatch('text/plain'); // true
mimeMatch('text/html'); // true

mimeMatch('image/png'); // false
```
