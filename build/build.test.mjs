import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from './build.mjs';

const fixture = new URL('./fixtures/deflated-42-pages.docx', import.meta.url);
const TEMPLATE = '<a href="{{file}}" download="{{file}}">get</a><p>{{version}} {{pages}} {{size}}</p>';

function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'rd-build-'));
  const sourceDir = join(root, 'site');
  const outDir = join(root, 'dist');
  mkdirSync(sourceDir);
  writeFileSync(join(sourceDir, 'index.html'), TEMPLATE);
  copyFileSync(fixture, join(sourceDir, 'RD_v12.docx'));
  return { root, sourceDir, outDir };
}

describe('buildSite', () => {
  test('writes a page that links and describes the document', () => {
    // Requirement: after a swap, the page links the new document and states its facts
    // Case: happy-path
    // Invariant: filename, version, page count and size all come from the document
    const { root, sourceDir, outDir } = workspace();
    try {
      const built = buildSite({ sourceDir, outDir });
      const html = readFileSync(join(outDir, 'index.html'), 'utf8');
      assert.deepEqual(built, { file: 'RD_v12.docx', version: 12 });
      assert.equal(html, '<a href="RD_v12.docx" download="RD_v12.docx">get</a><p>v12 42 pages 0.0 MB</p>');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('publishes the document byte for byte and nothing stale', () => {
    // Requirement: readers download exactly the committed file, and old versions disappear
    // Case: boundary
    // Invariant: the output holds only the page and the current document
    const { root, sourceDir, outDir } = workspace();
    try {
      mkdirSync(outDir);
      writeFileSync(join(outDir, 'RD_v11.docx'), 'stale');
      buildSite({ sourceDir, outDir });
      assert.deepEqual(readdirSync(outDir).sort(), ['RD_v12.docx', 'index.html']);
      assert.deepEqual(readFileSync(join(outDir, 'RD_v12.docx')), readFileSync(fixture));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
