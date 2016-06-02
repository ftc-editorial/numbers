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
    filename = filename + '/index.html';
  }

  return filename;
}

const link = 'https://ig.ft.com/sites/numbers/economies/china/'
console.log(urlToFilename(link));

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

// parameter @object target
// keys extracted from element's class name.
// {
//  "chart-title": "", 
//  "chart-subtitle": "", 
//  "chart-source": "", 
//  "chart-key": []
// }

function translate(source, target) {

  const keys = Object.keys(target);

  const $ = cheerio.load(source, {
    decodeEntities:false,
    xmlMode: true
  });

  keys.forEach(function(key) {
    const targetText = target[key];
    const el = $('.' + key);     

    if (el.length > 0) {
      const elTagName = el[0].name.toLowerCase();

      if ( elTagName === 'text') {
        el.text(targetText);
        el.removeAttr('font-family');
      } else {
        el.find('text').each(function(i) {
          $(this).text(targetText[i]);
          $(this).removeAttr('font-family');
        });
      }        
    }
  });

  return $.html();  
}

exports.urlToFilename = urlToFilename;
exports.getSvgLinks = getSvgLinks;
exports.getFilePaths = getFilePaths;
exports.translate = translate;