import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { findDocument, formatSize, pagesLabel, render } from './site.mjs';

describe('findDocument', () => {
  test('picks the single RD document among other files', () => {
    // Requirement: the site serves whichever RD_v<N>.docx sits in site/
    // Case: happy-path
    // Invariant: the version is the number in the filename
    const found = findDocument(['index.html', 'RD_v1013.docx', 'notes.txt']);
    assert.deepEqual(found, { file: 'RD_v1013.docx', version: 1013 });
  });

  test('ignores Word lock files and copy-suffixed names', () => {
    // Requirement: only a cleanly named document counts
    // Case: boundary
    // Invariant: ~$ lock files and _1 copies never become the download
    const found = findDocument(['~$_v1013.docx', 'RD_v1013_1.docx', 'RD_v7.docx', 'xRD_v9.docx', 'RD_v9.docx.bak']);
    assert.deepEqual(found, { file: 'RD_v7.docx', version: 7 });
  });

  test('fails when no RD document is present', () => {
    // Requirement: a swap that deletes the old doc without adding the new one fails the build
    // Case: error
    // Invariant: the site never publishes without a download
    assert.throws(() => findDocument(['index.html']), /no RD_v<N>\.docx/);
  });

  test('fails when more than one RD document is present', () => {
    // Requirement: a swap that adds the new doc without removing the old one fails the build
    // Case: error
    // Invariant: the site never has to guess which version is current
    assert.throws(() => findDocument(['RD_v948.docx', 'RD_v1013.docx']), /RD_v948\.docx, RD_v1013\.docx/);
  });
});

describe('formatSize', () => {
  test('formats bytes as decimal megabytes to one place', () => {
    // Requirement: the page states the download size
    // Case: happy-path
    // Invariant: 1 MB is 1,000,000 bytes
    assert.equal(formatSize(5226210), '5.2 MB');
    assert.equal(formatSize(12345678), '12.3 MB');
  });

  test('rounds half up at the tenth', () => {
    // Requirement: sizes round to the nearest tenth of a megabyte
    // Case: boundary
    // Invariant: 0.95 MB rounds to 1.0, just below it rounds to 0.9
    assert.equal(formatSize(950000), '1.0 MB');
    assert.equal(formatSize(949999), '0.9 MB');
  });
});

describe('pagesLabel', () => {
  test('pluralises the page count', () => {
    // Requirement: the page states the page count in English
    // Case: boundary
    // Invariant: one page is singular, every other count plural
    assert.equal(pagesLabel(573), '573 pages');
    assert.equal(pagesLabel(1), '1 page');
  });
});

describe('render', () => {
  test('replaces every placeholder, including repeats', () => {
    // Requirement: the template's placeholders take the document's values
    // Case: happy-path
    // Invariant: no placeholder survives into the output
    const out = render('<a href="{{file}}" download="{{file}}">{{version}}</a>', { file: 'RD_v2.docx', version: 'v2' });
    assert.equal(out, '<a href="RD_v2.docx" download="RD_v2.docx">v2</a>');
  });

  test('fails on a placeholder with no value', () => {
    // Requirement: a template typo fails the build
    // Case: error
    // Invariant: a raw {{name}} never reaches readers
    assert.throws(() => render('<p>{{pages}} {{sise}}</p>', { pages: '3 pages' }), /\{\{sise\}\}/);
  });
});
