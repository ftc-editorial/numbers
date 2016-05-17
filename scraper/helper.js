const url = require('url');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

function urlToFilename(uri) {
  const parsedUrl = url.parse(uri);
  const urlPath = parsedUrl.path.split('/')
    .filter(function(component) {
      return component !== '';
    })
    .join('/');
  var filename = path.join(parsedUrl.hostname, urlPath);

  if (!path.extname(filename)) {
    filename = filename + '.html';
  }

  return filename;
}

function getSvgLinks(body) {
  const $ = cheerio.load(body, {
    decodeEntities:false,
    xmlMode: true
  });

  const links = $('object')
    .map(function(i) {
      return $(this).attr('data')
    })
    .get()
    // .filter(function(element) {
    //   return /(autograph)/.test(element)
    // });
  return links;
}

function getFilePaths(body) {
  const paths = getSvgLinks(body)
    .filter(function(element) {
      return /(autograph)/.test(element)
    })
    .map(function(element) {
      return urlToFilename(element);
    });
  return paths;
}

exports.urlToFilename = urlToFilename;
exports.getSvgLinks = getSvgLinks;
exports.getFilePaths = getFilePaths;

if (require.main === module) {
  fs.readFile('ig.ft.com/autograph/graphics/sources-of-china-s-growth.svg', function(err, data) {
    const $ = cheerio.load(data, {
      decodeEntities:false,
      xmlMode: true
    });

    console.log($.html());
  });
}