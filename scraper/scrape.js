const fs= require('fs');
const path = require('path');
//const url = require('url');
const mkdirp = require('mkdirp');

const request = require('request');

const helper = require('./helper');

const page = 'https://ig.ft.com/sites/numbers/economies/china/';


function spider(url, nesting, callback) {
	const filename = helper.urlToFilename(url);

	fs.readFile(filename, 'utf8', function(err, body) {
		if (err) {
			if (err.code !== 'ENOENT') {
				return callback(err);
			}

			return download(url, filename, function(err, body) {
				if (err) {
					return callback(err);
				}

				spiderLinks(url, body, nesting, callback);
			});
		}

		spiderLinks(url, body, nesting, callback);
	});
}
// body: the content of currentUrl pointed to.
function spiderLinks(currentUrl, body, nesting, callback) {
	if (nesting === 0) {
		return process.nextTick(callback);
	}
// Obtain the list of all the links contained in the page
	var links = helper.getSvgLinks(body);

	function iterate(index) {``
		console.log('iterating ' + index);
		if (index === links.length) {
			return callback();
		}
		spider(links[index], nesting - 1, function(err) {
			if (err) {
				return callback(err);
			}
			iterate(index + 1)
		});
	}
	iterate(0);
}

function download(url, filename, callback) {
	console.log('Downloading ' + url);
	request(url, function(err, response, body) {
		if (err) {
			console.log('Download failed due to:');
			return callback(err); 
		}

		saveFile(filename, body, function(err) {
			console.log('Downloaded and saved: ' + url);
			if (err) {
				return callback(err);
			}

			callback(null, body);
		});

	});
}

function saveFile(filename, contents, callback) {
	console.log('Saveing filename: ' + filename);

	mkdirp(path.dirname(filename), function(err) {
		if (err) {
			return callback(err);
		}
		fs.writeFile(filename, contents, callback);
	});
}

spider(page, 1, function(err, filename) {
	if (err) {
		console.log(err);
		process.exit();
	} else {
		console.log('Download complete');
	}
});