var zmq = require('zmq');
var socket = zmq.createSocket('pull');
var resultSocket = zmq.createSocket('push');
var request = require('request');
var fs = require('fs');

var endpoint = process.env.SCHEDULER_ENDPOINT || 'tcp://127.0.0.1:5554';
var resultEndpoint = process.env.DOWNLOADER_ENDPOINT || 'tcp://127.0.0.1:5555';

console.log('Starting donwloader...');

socket.connect(endpoint);
console.log('Downloader connected to: ' + endpoint);
resultSocket.bindSync(resultEndpoint);
console.log('Downloader will push result to: ' + resultEndpoint);

socket.on('message', function (msg) {
  var parsedMessage = JSON.parse(msg); // TODO: handle parse error
  console.log('Message received: ', parsedMessage);
  downloadAndPipeToFile(parsedMessage, function () {
    console.log('Finished donwloading file: ', parsedMessage);
    publishResult(parsedMessage);
  });
});

function _handleError(message) {
  return function (err) {
    console.error('Error downloading page: ' + message.url + '. Error: ' + err);
  };
}

function downloadAndPipeToFile(message, callback) {
  var resultFileName = 'downloads/' + message.name + new Date().getTime();

  message.fileName = resultFileName;

  return request(message.url)
    .on('error', _handleError(message))
    .pipe(fs.createWriteStream(resultFileName))
    .on('error', _handleError(message))
    .on('finish', callback);
};

function publishResult(message) {
  resultSocket.send(JSON.stringify(message));
  console.log('Result published: ', message);
}
