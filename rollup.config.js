const bowerResolve = require('rollup-plugin-bower-resolve');
const buble = require('rollup-plugin-buble');

export default {
  entry: './client/main.js',
  format: 'iife',
  plugins: [
    bowerResolve(),
    buble()
  ],
  sourceMap: true,
  sourceMapFile: 'main.js.map',
  dest: './.tmp/scripts/main.js',
}