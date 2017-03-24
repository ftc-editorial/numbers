const path = require('path');

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
				resource: {
					test: /\.js$/,
					include: [
						path.resolve(__dirname, 'client'),
						path.resolve(__dirname, 'bower_components')
					],
				},
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['latest']
						}
					}
				]
			}
		]
	},
	resolve: {
		modules: [
			path.resolve(__dirname, 'bower_components'),
		],
		mainFields: ['module'],
		extensions: ['js']
	},
	target: 'web'
};