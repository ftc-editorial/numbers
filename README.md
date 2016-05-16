## Gulp Commands

`gulp serve`

## Data

Text in model/example.json

SVG text in scraper/svg-text-cn.json

**DO NOT** touch `model/footer.json`.

## Scraper

Download all svg files into ig.ft.com/autograph/graphics folder, add translated text and procude new svg files.

### Usage
Change directory to scraper:
```
cd scraper 
```

Download svgs:
```
node scraper.js
```

Replace with chinese text:
```
node translate.js
```

Extract svg text from the english version: (you may not need to run this command):
```
node extracter.js
```

## Note
Always set `xmlMode:true` for cheerio when dealing with svg.

