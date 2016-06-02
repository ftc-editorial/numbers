const fs= require('fs');
const path = require('path');
const co = require('co');
const helper = require('./helper');

const indexPage = 'ig.ft.com/sites/numbers/economies/china/index.html';

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

      const translatedSvg = helper.translate(svg.content, targetData[svg.filename]);

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
