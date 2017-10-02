const minify = require('rollup-plugin-babel-minify');
const babel = require('rollup-plugin-babel');
const bowerResolve = require('rollup-plugin-bower-resolve');

export default {
  input: 'client/main.js',
  plugins: [
    bowerResolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    minify()
  ],
  output: {
    file: 'public/scripts/main.js',
    format: 'iife',
  }
};