const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');
const bowerResolve = require('rollup-plugin-bower-resolve');

export default {
  entry: 'client/main.js',
  plugins: [
    bowerResolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    babili()
  ],
  targets: [
    {
      dest: 'public/scripts/main.js',
      format: 'iife',
    }
  ]
};