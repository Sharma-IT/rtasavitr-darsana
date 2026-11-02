import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageCount } from './docx.mjs';

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url));

describe('pageCount', () => {
  test('reads the page count from a deflated docx', () => {
    // Requirement: the page shows Word's own page count, read from docProps/app.xml
    // Case: happy-path
    // Invariant: Word writes its parts deflated, so deflate must be decoded
    assert.equal(pageCount(fixture('deflated-42-pages.docx')), 42);
  });

  test('reads past extra fields, entry comments and an archive comment', () => {
    // Requirement: any well-formed archive Word or another editor writes is read correctly
    // Case: boundary
    // Invariant: variable-length header fields are skipped by their declared lengths
    assert.equal(pageCount(fixture('annotated-13-pages.docx')), 13);
  });

  test('rejects a docx whose app.xml is not deflated', () => {
    // Requirement: Word deflates every part, so any other method fails the build loudly
    // Case: error
    // Invariant: bytes are never read under a compression method the reader does not decode
    assert.throws(() => pageCount(fixture('stored-7-pages.docx')), /compression method 0/);
  });

  test('rejects bytes that are not a zip', () => {
    // Requirement: a corrupt or mislabelled file fails the build
    // Case: error
    // Invariant: no end-of-central-directory record means no archive
    assert.throws(() => pageCount(Buffer.alloc(100, 'x')), /not a zip/);
  });

  test('treats an empty archive as lacking app.xml', () => {
    // Requirement: an archive with no entries fails as a document without statistics
    // Case: boundary
    // Invariant: an end record at byte 0 is still found
    assert.throws(() => pageCount(fixture('empty.docx')), /docProps\/app\.xml/);
  });

  test('rejects a docx without docProps/app.xml', () => {
    // Requirement: a document without Word's statistics fails the build
    // Case: error
    // Invariant: a missing count is never published as a guess
    assert.throws(() => pageCount(fixture('no-app-xml.docx')), /docProps\/app\.xml/);
  });

  test('rejects an app.xml that carries no page count', () => {
    // Requirement: statistics lacking <Pages> fail the build
    // Case: error
    // Invariant: a missing count is never published as a guess
    assert.throws(() => pageCount(fixture('no-pages.docx')), /<Pages>/);
  });
});
