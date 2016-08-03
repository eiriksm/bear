/* eslint no-console: 0 */
'use strict';
var util = require('util');
var url = require('url');
var https = require('https');

module.exports = search;

function search(opts, callback) {
  let config = opts.config;
  if (!opts.url) {
    opts.url = 'https://api.untappd.com/v4/search/beer?q=';
  }
  if (config.untappdUrl) {
    opts.url = config.untappdUrl;
  }
  opts.url += opts.name;
  opts.url += util.format('&client_id=%s&client_secret=%s&access_token=%s', config.client_id, config.client_secret, config.access_token);
  var urlopts = url.parse(opts.url);
  urlopts.method = 'GET';
  urlopts.withCredentials = false;
  var req = https.request(urlopts, function(res) {
    var buffer = '';
    res.on('data', function(d) {
      buffer += d;
    });
    res.on('end', function() {
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
  req.end();
}
