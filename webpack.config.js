const path = require('path');
const webpack = require('webpack');
const BowerWebpackPlugin = require('bower-webpack-plugin');

const config = {
	entry: './client/js/main.js',
	output: {
		path: path.resolve(__dirname, '.tmp/scripts'),
		filename: 'main.js',
		sourceMapFilename: '[file].map'
	},
	// watch: true,
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [
					path.resolve(__dirname, 'client/js'),
					path.resolve(__dirname, 'bower_components')
				],
				loader: 'babel-loader',
				options: {
					presets: ['es2015']
				}
			}
		]
	},
	resolve: {
		modules: [
			path.resolve(__dirname, 'bower_components'),
		],
		mainFiles: ['main'],
		extensions: ['js']
	},
	target: 'web'
};

if (process.env.NODE_ENV === 'production') {
	delete webpackConfig.watch;
}

function webpackPromisify() {
  return new Promise(function(resolve, reject) {
    webpack(config, (err, stats) => {
			err ? reject(err) : resolve(stats);
    });
  });
}

module.exports = webpackPromisify;

// module.exports = config;