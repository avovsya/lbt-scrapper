# lbt-scrapper

## Prerequisites
node.js >= 0.10.0

zmq ~= 4.0

## How to run

Install dependencies:
  `npm install`

Run:
  `./run.sh`

`productData.json` will be overwritten with the new products for each site

Or run services separately:

  `node parser.js`
  
  `node downloader.js`
  
  `node scheduler.js`
  
## How to add website to download:
1. Add website name and url to `config.json`
2. Add parsing rules(use existing rule as a template) to `rules.json`. Name should be the same as in `config.json`
