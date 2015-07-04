var zmq = require('zmq');
var socket = zmq.createSocket('pull');
var fs = require('fs');
var _ = require('lodash');
var Xray = require('x-ray');
var xray = Xray();

var endpoint = process.env.DOWNLOADER_ENDPOINT || 'tcp://127.0.0.1:5555';

socket.connect(endpoint);
console.log('Parser connected to: ' + endpoint);

socket.on('message', function (msg) {
  var parsedMessage = _parseJson(msg);
  console.log('Message received: ', parsedMessage);

  fs.readFile(parsedMessage.fileName, { encoding: 'utf8' }, function (err, file) {
    if (err) {
      return console.error('Error reading file: ', parsedMessage, err);
    }
    parse(parsedMessage, file, function (err, result) {
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
    products: xray(rule.productCard, [rule.product])
  })(callback);
}

function saveProducts(message, retailerInfo) {
  var productData = getProductDataJson();
  var currentProducts = productData[message.name] || [];

  // Leave only those products that we haven't seen yet.
  retailerInfo.products = productDifference(retailerInfo.products, currentProducts);

  // TODO. If whole page of products new for us, then we can have some new
  // products on the next page. Handle this.

  // Overwriting list of new products for a retailer
  productData[message.name] = retailerInfo.products;

  saveProductDataJson(productData);
}

function getProductDataJson() {
  console.log('Getting product data');
  var file = fs.readFileSync('./productData.json', { encoding: "utf8" });
  return _parseJson(file);
}

function saveProductDataJson(productData) {
  console.log('Saving product data');
  fs.writeFile('./productData.json', JSON.stringify(productData), function (err) {
    if (err) {
      return console.error('Error saving productData.json: ', err);
    }
    return console.log('Product data saved successfully!');
  });
}

function productDifference(newProducts, oldProducts) {
  return _.filter(newProducts, function (product) {
    return !_.find(oldProducts, 'id', product.id);
  });
}

function _parseJson(json) {
  var result;
  try {
    result = JSON.parse(json);
  } catch (e) {
    console.error('Error parsing JSON: ', json);
    process.exit(1);
  }
  return result;
}
