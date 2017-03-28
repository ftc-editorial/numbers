## Gulp Commands

`gulp serve`

## Data

Text in model/example.json

SVG text in scraper/svg-text-cn.json

**DO NOT** touch `model/footer.json`.

## Scrape

Switched scrape.js to scrape.sh.
Use `wget` to download the site.

**You need to install `wget` first on you system**. On Mac:

```
brew install wget
```

### Usage
Change directory to scraper:
```
cd scraper 
source scrape.sh
```

### Extract Text from Orginal SVG:
```
node extract.js
```

###
Replace English Text in SVG with Chinese text:
```
node translate.js
```

## Note
Always set `xmlMode:true` for cheerio when dealing with svg.

## Bertha URL
```
https://bertha.ig.ft.com/view/publish/gss/1LUNu-fNmH4fY4KYkoYXoUoRi6BsLQpJBr75Liuix9TA/data

https://bertha.ig.ft.com/view/publish/gss/1j6V0OpSP4KJRaWirUGoPRU1rA5ACL7Y_x32ZFg1-GnE/data,credits,groups,options
```