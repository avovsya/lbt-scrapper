var zmq = require('zmq');
var socket = zmq.createSocket('push');

var endpoint = process.env.SCHEDULER_ENDPOINT || 'tcp://127.0.0.1:5554';

socket.bindSync(endpoint);

// On start: send to downloader all retailer sites from config.json
var config = require('./config.json');
config.sites.forEach(sendMessage);

function sendMessage(message) {
  console.log("Sending site: ", message);
  socket.send(JSON.stringify(message));
}
