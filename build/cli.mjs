import { fileURLToPath } from 'node:url';
import { buildSite } from './build.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { file, version } = buildSite({ sourceDir: `${root}site`, outDir: `${root}dist` });
console.log(`built dist/ for ${file} (v${version})`);
