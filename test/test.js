'use strict';

const assert = require('assert');
const compileMimeMatch = require('..');

describe('compileMimeMatch(mimeType)', () => {

  it('should ignore params', () => {
    const mimeType = 'text/html; charset=utf-8';

    assert.strictEqual(compileMimeMatch('text/*')(mimeType), true);
    assert.strictEqual(compileMimeMatch('text/html')(mimeType), true);
    assert.strictEqual(compileMimeMatch('*/html')(mimeType), true);

    assert.strictEqual(compileMimeMatch(['text/*', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['text/html', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['*/html', 'image/*'])(mimeType), true);
  });

  it('should ignore params OWS', () => {
    const mimeType = 'text/html ; charset=utf-8';

    assert.strictEqual(compileMimeMatch('text/*')(mimeType), true);
    assert.strictEqual(compileMimeMatch('text/html')(mimeType), true);
    assert.strictEqual(compileMimeMatch('*/html')(mimeType), true);

    assert.strictEqual(compileMimeMatch(['text/*', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['text/html', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['*/html', 'image/*'])(mimeType), true);
  });

  it('should ignore casing', () => {
    const mimeType = 'text/HTML';

    assert.strictEqual(compileMimeMatch('text/*')(mimeType), true);
    assert.strictEqual(compileMimeMatch('text/html')(mimeType), true);
    assert.strictEqual(compileMimeMatch('*/html')(mimeType), true);

    assert.strictEqual(compileMimeMatch(['text/*', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['text/html', 'image/*'])(mimeType), true);
    assert.strictEqual(compileMimeMatch(['*/html', 'image/*'])(mimeType), true);
  });

  it('should throw if given an invalid type', () => {
    assert.throws(() => compileMimeMatch(undefined), TypeError);
    assert.throws(() => compileMimeMatch(null), TypeError);
    assert.throws(() => compileMimeMatch(true), TypeError);
    assert.throws(() => compileMimeMatch(() => {}), TypeError);
    assert.throws(() => compileMimeMatch(['text/plain', false]), TypeError);
    assert.throws(() => compileMimeMatch([{}, 'text/plain']), TypeError);
  });

  it('should throw if given a malformed MIME type', () => {
    assert.throws(
      () => compileMimeMatch('text/html{}'),
      /MIME type must be in the "type\/subtype" format or the "\+suffix" short-form/
    );
    assert.throws(
      () => compileMimeMatch('text/html/'),
      /MIME type must be in the "type\/subtype" format or the "\+suffix" short-form/
    );
    assert.throws(
      () => compileMimeMatch('tex[t/html/'),
      /MIME type must be in the "type\/subtype" format or the "\+suffix" short-form/
    );
    assert.throws(
      () => compileMimeMatch(['text/html', 'bogus']),
      /MIME type must be in the "type\/subtype" format or the "\+suffix" short-form/
    );
  });


  describe('given one type', () => {

    it('should properly match the type', () => {
      const mimeType = 'image/png';

      assert.strictEqual(compileMimeMatch('image/png')(mimeType), true);
      assert.strictEqual(compileMimeMatch('image/*')(mimeType), true);
      assert.strictEqual(compileMimeMatch('*/png')(mimeType), true);

      // Single type in an array
      assert.strictEqual(compileMimeMatch(['image/png'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['image/*'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['*/png'])(mimeType), true);

      assert.strictEqual(compileMimeMatch('image/jpeg')(mimeType), false);
      assert.strictEqual(compileMimeMatch('image/png+json')(mimeType), false);
      assert.strictEqual(compileMimeMatch('text/*')(mimeType), false);
      assert.strictEqual(compileMimeMatch('*/jpeg')(mimeType), false);
      assert.strictEqual(compileMimeMatch('something/bogus*')(mimeType), false);
    });

  });


  describe('given multiple types', () => {

    it('should match one of the types or return false', () => {
      const mimeType = 'image/png';

      assert.strictEqual(compileMimeMatch(['text/*', 'image/*'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['image/*', 'text/*'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['image/*', 'image/png'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['image/png', 'image/*'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['*/png', 'text/*'])(mimeType), true);
      assert.strictEqual(compileMimeMatch(['*/png', 'text/*+json'])('text/calendar+json'), true);

      assert.strictEqual(compileMimeMatch(['text/*', 'application/*'])(mimeType), false);
      assert.strictEqual(compileMimeMatch(['text/*', '*/*+png'])(mimeType), false);
      assert.strictEqual(compileMimeMatch(['text/html', 'text/plain', 'application/json'])(mimeType), false);
    });

  });


  describe('given +suffix', () => {

    it('should match suffix types', () => {
      const mimeType = 'application/vnd+json';

      assert.strictEqual(compileMimeMatch('+json')(mimeType), true);
      assert.strictEqual(compileMimeMatch(mimeType)(mimeType), true);
      assert.strictEqual(compileMimeMatch('application/*+json')(mimeType), true);
      assert.strictEqual(compileMimeMatch('*/vnd+json')(mimeType), true);

      assert.strictEqual(compileMimeMatch('application/json')(mimeType), false);
      assert.strictEqual(compileMimeMatch('text/*+json')(mimeType), false);
    });

  });


  describe('given */*', () => {

    it('should match any MIME type', () => {
      const mimeMatch = compileMimeMatch('*/*');

      assert.strictEqual(mimeMatch('text/html'), true);
      assert.strictEqual(mimeMatch('text/html;charset=utf-8'), true);
      assert.strictEqual(mimeMatch('text/html ; charset=utf-8'), true);
      assert.strictEqual(mimeMatch('text/xml'), true);
      assert.strictEqual(mimeMatch('application/json'), true);
      assert.strictEqual(mimeMatch('application/vnd+json'), true);
      assert.strictEqual(mimeMatch('application/vnd.something+json'), true);
    });

    it('should not match invalid MIME types', () => {
      const mimeMatch = compileMimeMatch('*/*');

      assert.strictEqual(mimeMatch('bogus'), false);
      assert.strictEqual(mimeMatch(''), false);
      assert.strictEqual(mimeMatch('/'), false);
      assert.strictEqual(mimeMatch('a/'), false);
      assert.strictEqual(mimeMatch('/b'), false);
    });

  });

});
