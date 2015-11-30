var config;
try {
  config = require('./config');
}
catch (err) {
}
var util = require('util');
var url = require('url');
var http = require('http');

module.exports = search;

function search(opts, callback) {
  if (!opts.url) {
    opts.url = 'https://api.untappd.com/v4/search/beer?q=';
  }
  opts.url += opts.name;
  opts.url += util.format('&client_id=%s&client_secret=%s&access_token=%s', config.client_id, config.client_secret, config.access_token);
  var urlopts = url.parse(opts.url);
  urlopts.method = 'GET';
  urlopts.withCredentials = false;
  var req = http.request(urlopts, function(res) {
    var buffer = '';
    res.on('data', function(d) {
      buffer += d;
    });
    res.on('end', function() {
      console.log(buffer);
      var json;
      try {
        json = JSON.parse(buffer);
      }
      catch (err) {
        callback(err);
        return;
      }
      callback(null, json);
    });
  });
  req.on('error', function(e) {
    console.log(e);
  });
  req.end();
}
