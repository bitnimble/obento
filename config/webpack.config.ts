// @ts-ignore
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
// @ts-ignore
import postcssModulesValuesReplace from 'postcss-modules-values-replace';
import { Configuration } from 'webpack';
import { Configuration as DevConfiguration } from 'webpack-dev-server';
import { PageManifest } from './manifest';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FontPreloadPlugin from 'webpack-font-preload-plugin';

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

const config = (env: any): Configuration => {
  if (env.entry == null) {
    throw new Error('Page was not specified. Exiting.');
  }

  console.log('Loading project manifest...')

  const devMode = env.mode === 'development';
  const [manifestFile, pageRoot, pageName] = getPageRoot(env.entry);
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

  const modules = [
    path.resolve(__dirname, '../node_modules'),
    path.resolve(`${pageRoot}/node_modules`),
    path.resolve(__dirname, '../src'),
  ];

  return {
    mode: devMode ? 'development' : 'production',
    devtool: devMode && 'cheap-module-source-map',
    entry: path.resolve(`${pageRoot}/index.tsx`),
    target: 'browserslist:> 0.5%, last 2 versions, Firefox ESR, not dead',
    devServer: { historyApiFallback: true },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: { transpileOnly: true },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: {
                  localIdentName: devMode
                    ? '[path][name]__[local]--[hash:base64:5]'
                    : '[hash:base64:6]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                postcssOptions: {
                  plugins: [
                    postcssModulesValuesReplace({ resolve: { modules } }),
                    'postcss-url',
                    'postcss-calc',
                    'postcss-color-function',
                    'autoprefixer',
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: (path: string) => {
              if (path === faviconPath) {
                return 'favicon.png';
              }
              return '[contenthash].[ext]';
            },
          },
        },
      ],
    },
    plugins: [
      new FontPreloadPlugin({
        extensions: ['otf'],
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        templateParameters: {
          title: manifest.title,
          description: manifest.description || '',
          head: mergedHead,
        },
        hash: true,
        template: path.resolve(__dirname, './static/index.html'),
      }),
    ],
    resolve: {
      fallback: manifest.fallback,
      // js and jsx includes for node_modules
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.css', '.jpeg'],
      modules,
    },
    output: {
      filename: 'index.[contenthash].js',
      publicPath: '/static/',
      path: path.resolve(__dirname, `../dist/${pageName}/`),
    },
  };
};

export default config;
