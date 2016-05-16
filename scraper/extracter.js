const fs= require('fs');
const path = require('path');
const url = require('url');
const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const helper = require('./helper');


function getSvgText(body) {

  const classNames = ['chart-title', 'chart-subtitle', 'chart-source', 'chart-key'];
  const textObj = {};

	const $ = cheerio.load(body, {
		xmlMode: true,	
  	decodeEntities: false
  });

  classNames.forEach(function(item) {
  	const itemEl = $(`.${item}`);

    if (itemEl.length > 0) {
      const itemTagName = itemEl[0].name.toLowerCase();
      if (itemTagName === 'text') {
        textObj[item] = itemEl.text();
      } else {
        textObj[item] = itemEl.find('text').map(function(i) {
          return $(this).text();
        })
        .get();
      }      
    }
  });

  return textObj;
}

const indexPage = 'ig.ft.com/sites/numbers/economies/china.html';

const testFile = 'ig.ft.com/autograph/graphics/sources-of-china-s-growth.svg';


function extractText(index, callback) {
  async.waterfall([
    function(callback) {
      fs.readFile(index, 'utf8', function(err, body) {
        if (err) { 
          return callback(err); 
        }
        
        const filePaths = helper.getFilePaths(body);

        callback(null, filePaths);
      });
    },
    function(filePaths, callback) {
      const svgText = {};

      filePaths.forEach(function(filePath) {

        fs.readFile(filePath, 'utf8', function(err, body) {
          if (err) { return callback(err); }
          filename = path.basename(filePath);

          svgText[filename] = getSvgText(body);

          callback(null, svgText);
        });
      });
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });  
}

extractText(indexPage, function(err, result) {
  if (err) {
    console.log(err);
  }
  const jsonResult = JSON.stringify(result, null, 4);
  const ws = fs.createWriteStream('svg-text-en.json');
  ws.write(jsonResult);
});