import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pageCount } from './docx.mjs';
import { findDocument, formatSize, pagesLabel, render } from './site.mjs';

export function buildSite({ sourceDir, outDir }) {
  const { file, version } = findDocument(readdirSync(sourceDir));
  const docx = readFileSync(join(sourceDir, file));
  const html = render(readFileSync(join(sourceDir, 'index.html'), 'utf8'), {
    file,
    version: `v${version}`,
    pages: pagesLabel(pageCount(docx)),
    size: formatSize(docx.length),
  });
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir);
  writeFileSync(join(outDir, 'index.html'), html);
  copyFileSync(join(sourceDir, file), join(outDir, file));
  return { file, version };
}
