import path from 'node:path';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

// This is possible because of `--bundleConfigAsCjs`
const pkg = require(path.resolve(process.cwd(), 'package.json'));

// Enable the compilation in to UMD for the browser.
const enableBrowser = pkg.browser != undefined;

// List some packages that should not be bundled.
const external = [/lodash\..*/, 'uuid'];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
        interop: 'auto',
      },
      {
        file: pkg.module,
        format: 'esm',
        exports: 'named',
        interop: 'auto',
      },
    ],
    plugins: [
      commonjs({
        strictRequires: 'auto',
      }),
      nodeResolve({
        preferBuiltins: true,
        browser: false,
      }),
      typescript({
        tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
        useTsconfigDeclarationDir: false,
      }),
      terser({ sourceMap: true }),
    ],
    external,
  },
];

if (enableBrowser) {
  configs.push({
    context: 'window',
    input: './src/index.ts',
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd',
      exports: 'named',
      globals: { 'lodash.chunk': '_' },
    },
    cache: false,
    plugins: [
      commonjs({
        strictRequires: 'auto',
      }),
      nodeResolve({
        browser: true,
      }),
      typescript({
        tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
        useTsconfigDeclarationDir: true,
      }),
      terser({ sourceMap: true }),
    ],
    external,
  });
}

export default configs;
