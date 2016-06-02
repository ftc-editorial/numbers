const fs= require('fs');
const path = require('path');
const url = require('url');
const co = require('co');
const request = require('request');
const cheerio = require('cheerio');
const helper = require('./helper');

const indexPage = 'ig.ft.com/sites/numbers/economies/china.html';


function readFilePromisified(file) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          const filename = path.basename(file);
          resolve({filename: filename, content: data});
        }
      });
    }
  );
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

co(function* () {
  try {
    const [index, json] = yield Promise.all([
      readFilePromisified(indexPage),
      readFilePromisified('svg-text-cn.json')
    ])

    const svgFiles = helper.getFilePaths(index.content);
    const targetData = JSON.parse(json.content);

    const svgContents = yield Promise.all(svgFiles.map(readFilePromisified));

    svgContents.forEach(function(svg) {
      console.log('Translating file: ' + svg.filename);

      const translatedSvg = translate(svg.content, targetData[svg.filename]);

      const destPath = '../client/graphics/';
      // const destPath = './client/';

      const destFilename = path.resolve(__dirname, destPath,  svg.filename);

      console.log('Writing translated file to: ' + destFilename);
      
      const ws = fs.createWriteStream(destFilename);
      ws.write(translatedSvg);

    });

  } catch(e) {
    console.log('Failure to read: ' + e);
  }
});
