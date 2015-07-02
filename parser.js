var zmq = require('zmq');
var socket = zmq.createSocket('pull');
var fs = require('fs');
var Xray = require('x-ray');
var xray = Xray();

var endpoint = process.env.SCHEDULER_ENDPOINT || 'tcp://127.0.0.1:5555';

socket.connect(endpoint);
console.log('Parser connected to: ' + endpoint);

socket.on('message', function (msg) {
  var parsedMessage = JSON.parse(msg); // TODO: handle parse error
  console.log('Message received: ', parsedMessage);

  fs.readFile(parsedMessage.fileName, function (err, file) {
    if (err) {
      return console.error('Error reading file: ', parsedMessage);
    }
    return parse(parsedMessage, file.toString('utf8'), function (err, result) {
      if (err) {
        return console.error('Error parsing document: ', err);
      }
      return saveProducts(parsedMessage, result);
    });
  });
});

function parse(message, file, callback) {
  var rule = require('./rules.json')[message.name];

  xray(file, {
    nextPage: rule.nextPage,
    products: xray(rule.productCard, [rule.product])
  })(callback);
};

function saveProducts(message, retailerInfo) {
  console.log('RESULT: ', retailerInfo);
  var currentProducts = getListOfProducts(message.name) || [];
  var numberOfNewProducts = retailerInfo.products.lengths;
  retailerInfo.products = retailerInfo.products.map(function(newProduct) {
  });
  // Save phase.
  // Get list of products that already save for this site
  // Compare this list with new products.
  // Save all new products
  // If all new products are seen for the first time, then there is
  // a chance that we have more products on a "next page" of the site. Push url to next page to the Downloader
};

function getProductJson(siteName) {
  var file = fs.readFileSync('./productData.json', { encoding: "utf8" });
  return JSON.parse(file);
}

function getListOfProducts(siteName) {
  return getProductJson(siteName)[siteName];
}




