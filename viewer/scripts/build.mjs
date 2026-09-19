import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, 'assets'), { recursive: true });
await build({
  absWorkingDir: root,
  entryPoints: ['src/main.js'],
  outfile: 'assets/studio.js',
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  target: ['es2022'],
  legalComments: 'eof',
  logLevel: 'info',
});

const dependencies = ['three', 'esbuild', 'playwright', 'playwright-core'];
const licenses = await Promise.all(dependencies.map(async (name) => {
  const base = path.join(root, 'node_modules', name);
  const pkg = JSON.parse(await readFile(path.join(base, 'package.json'), 'utf8'));
  let license;
  for (const filename of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
    try {
      license = await readFile(path.join(base, filename), 'utf8');
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  if (!license) throw new Error(`Missing license: ${name}`);
  return `${'='.repeat(72)}\n${name} ${pkg.version} (${pkg.license})\n${'='.repeat(72)}\n\n${license.trim()}\n`;
}));
const notices = `Octoprints Phase 1 viewer — third-party notices\n\n`
  + `The served JavaScript includes Three.js. esbuild and Playwright are build/test tools only.\n`
  + `No external fonts, CDNs, telemetry, or remote runtime dependencies are used.\n\n`
  + licenses.join('\n');
await Promise.all(['THIRD_PARTY_LICENSES.txt', 'assets/THIRD_PARTY_LICENSES.txt'].map(
  (filename) => writeFile(path.join(root, filename), notices),
));
console.log('Offline bundle retained: viewer/assets/studio.js + studio.css');
