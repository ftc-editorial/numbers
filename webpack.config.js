const path = require('path');
const webpack = require('webpack');
const BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
	entry: './client/main.js',
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
			'bower_components',
		],
		mainFields: ['module'],
		extensions: ['js']
	},
	target: 'web'
};