import esbuild from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import * as path from 'path';
import { PageManifest } from '../config/manifest';
import * as fs from 'fs';
// @ts-ignore
import postcssModulesValuesReplace from 'postcss-modules-values-replace';
import postcssUrl from 'postcss-url';
import postcssCalc from 'postcss-calc';
// @ts-ignore
import postcssColorFunction from 'postcss-color-function';
import autoprefixer from 'autoprefixer';
// @ts-ignore
import * as postcssPlugin from 'esbuild-plugin-postcss2';

function getPageRoot(pageInput: string) {
  const pageName = path.basename(pageInput);
  try {
    const manifest = require(path.resolve(__dirname, `../src/pages/${pageInput}/manifest.ts`));
    return [manifest, path.resolve(__dirname, `../src/pages/${pageInput}`), pageName];
  } catch (e) { }

  try {
    console.log('Could not resolve manifest in src/pages, attempting to resolve as an absolute path');
    const manifest = require(path.resolve(`${pageInput}/manifest.ts`));
    return [manifest, path.resolve(`${pageInput}`), pageName];
  } catch (e) { }

  throw new Error(`Could not find manifest.ts for page ${pageInput}`);
}

const entry = process.env.ENTRY;
const mode = process.env.MODE;
const watch = process.env.WATCH;

if (entry == null) {
  throw new Error('Page was not specified. Exiting.');
}

console.log('Loading project manifest...')

const devMode = mode === 'development';
const [manifestFile, pageRoot, pageName] = getPageRoot(entry);
console.log(`Loaded manifest from ${pageRoot}/manifest.ts`);
const manifest: PageManifest = manifestFile.manifest;
const fonts = manifest
  .head
  ?.googleFonts
  ?.map(s => {
    if (typeof s === 'string') {
      return `family=${s.replace(/ /g, '+')}`;
    }
    return `family=${s.name.replace(/ /g, '+')}:wght@${s.weights.join(';')}`;
  })
  .join('&');
const additionalTags = manifest.head?.additionalTags?.join('\n') || '';
const mergedHead = fonts
  ? `
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet">
${additionalTags}
`
  : additionalTags;

const faviconPath = path.resolve(`${pageRoot}/favicon.png`);
const entryPoint = path.resolve(`${pageRoot}/index.tsx`);
const htmlTemplate = fs.readFileSync(path.resolve(__dirname, './static/index_esbuild.html'),  'utf-8');
const modules = [
  path.resolve(__dirname, '../node_modules'),
  path.resolve(`${pageRoot}/node_modules`),
  path.resolve(__dirname, '../src'),
];

const options: esbuild.BuildOptions = {
  entryPoints: [entryPoint],
  bundle: true,
  metafile: true,
  outdir: path.resolve(__dirname, `../dist/${pageName}/`),
  entryNames: 'index.[hash]',
  assetNames: '[hash]',
  minify: !devMode,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11'],
  publicPath: '/static/',
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'file',
    '.webp': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.eof': 'file',
    '.ttf': 'file',
    '.otf': 'file',
  },
  plugins: [
    postcssPlugin.default({
      modules: true,
      writeToFile: true,
      fileIsModule: (filepath: string) => !filepath.endsWith('.global.css'),
      plugins: [
        postcssModulesValuesReplace({ resolve: { modules } }),
        postcssUrl(),
        postcssCalc(),
        postcssColorFunction(),
        autoprefixer(),
      ]
    }),
    htmlPlugin({
      files: [
        {
          entryPoints: [path.relative(path.resolve(__dirname, '../'), entryPoint)],
          filename: 'index.html',
          htmlTemplate,
          title: manifest.title,
          favicon: fs.existsSync(faviconPath) ? faviconPath : undefined,
          define: {
            mergedHead,
            title: manifest.title,
            description: manifest.description || '',
          }
        }
      ]
    }),
  ]
};

(async () => {
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
})();
