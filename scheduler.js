var zmq = require('zmq');
var socket = zmq.createSocket('push');

var endpoint = process.env.SCHEDULER_ENDPOINT || 'tcp://127.0.0.1:5554';

socket.bindSync(endpoint);

var config = require('./config.json');
config.sites.forEach(function (site) {
  console.log("Sending site: ", site);
  socket.send(JSON.stringify(site));
});
// read file with the list of sites to download
// push list into queue
