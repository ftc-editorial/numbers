const fs= require('fs');
const path = require('path');
const cheerio = require('cheerio');
const helper = require('./helper');

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

const indexPage = 'ig.ft.com/sites/numbers/economies/china/index.html';

readFilePromisified(indexPage)
// value is an object {filename: , content: }
  .then(function(value) {
    console.log(value.filename);
    const svgFiles = helper.getFilePaths(value.content);
    console.log(svgFiles);
    return svgFiles;
  })
  .then(function(value) {
    return Promise.all(value.map(readFilePromisified));
  })
  .then(function(value) {
    const svgTextObj = {};

    value.forEach(function(item) {
      const svgText = getSvgText(item.content);
      svgTextObj[item.filename] = svgText;
      console.log(svgTextObj);
    });

    return JSON.stringify(svgTextObj, null, 4);
  })
  .then(function(value) {
    const ws = fs.createWriteStream('svg-text-en.json');
    ws.write(value);    
  })
  .catch(function(error) {
    console.log(error);
  });