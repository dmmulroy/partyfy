const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');

const pkg = require('./package.json');

module.exports = [
  {
    input: 'src/partyfy.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [resolve({ preferBuiltins: true }), commonjs(), json()]
  }
];
