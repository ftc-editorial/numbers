const fs= require('fs');
const path = require('path');
const url = require('url');
const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const helper = require('./helper');


function translateAndSave(filepath, translatedData, callback) {
  fs.readFile(filepath, 'utf8', function(err, contents) {

    if (err) { 
      return callback(err); 
    }

    const destPath = '../client/graphics/';

    const filename = path.basename(filepath);
    console.log('Translating file ' + filename);

    const textObj = translatedData[filename];
    const destFilename = path.resolve(__dirname, destPath,  filename);  

    if (!textObj) {
      console.log('Translation text for ' + filename + 'does not exist.');
      return;
    }

    const newContents = getTranslatedContents(contents, textObj);
    console.log('Saving: ' + destFilename);

    const ws = fs.createWriteStream(destFilename);

    ws.write(newContents);
  });
}

function getTranslatedContents(contents, textObj) {
  const textKeys = Object.keys(textObj);

  const $ = cheerio.load(contents, {
    decodeEntities:false,
    xmlMode: true
  });

  textKeys.forEach(function(textKey) {
    const textValue = textObj[textKey];
    const el = $('.'+textKey);     

    if (el.length > 0) {
      const elTagName = el[0].name.toLowerCase();

      if ( elTagName === 'text') {
        el.text(textValue);
        el.removeAttr('font-family');
      } else {
        el.find('text').each(function(i) {
          $(this).text(textValue[i]);
          $(this).removeAttr('font-family');
        });
      }        
    }
  });

  return $.html();  
}

function translate(index, translation, callback) {
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
      fs.readFile(translation, 'utf8', function(err, cnData) {
        if (err) {
          return callback(err);
        }
        const parsedData = JSON.parse(cnData);
        callback(null, filePaths, parsedData);
      });
    },

    function(filePaths, parsedData, callback) {

      async.each(filePaths, function(filepath, callback) {

        translateAndSave(filepath, parsedData, callback);
      });
    },
    function(callback) {
      callback(null, 'done');
    }
  ], function(err, result) {
    if (err) {
      console.log(err);
    }
  });
}

const indexPage = 'ig.ft.com/sites/numbers/economies/china.html';
const svgTextCn = 'svg-text-cn.json';

translate(indexPage, svgTextCn, function(err, result) {
  if (err) {
    console.log(err)
  }
  console.log(result);
});