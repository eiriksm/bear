var cheerio = require('cheerio');
var http = require('http');
var url = require('url');

var c;

module.exports = function(chrome) {
  if (!c) {
    c = chrome;
  }
  chrome.contextMenus.create({
    title: 'Search ratebeer',
    contexts: [
       "selection"
    ],
    onclick: onSelectionClick
  });
};

function onSelectionClick(info) {
  // Find selection text.
  var text = info.selectionText;
  // Post request to ratebeer.
  getBeer(text);
}

function getBeer(text) {
  var opts = url.parse('http://www.ratebeer.com/findbeer.asp?BeerName=' + text);
  opts.method = 'POST';
  opts.port = 80;
  opts.scheme  ='http';
  var req = http.request(opts, function(res) {
    var buffer = '';
    res.on('data', function(d) {
      buffer += d;
    });
    res.on('end', function() {
      var $ = cheerio.load(buffer);
      $('#container .results tr').each(function(i, n) {
        var header = $(n).attr('bgcolor');
        if (header && header.length) {
          // This is table header. Stupid markup.
          return;
        }
        var name = $(n).find('td:nth-child(1)').text();
        var rating = $(n).find('td:nth-child(4)').text();
        if (!rating) {
          return;
        }
        var opt = {
          type: "basic",
          title: "Rating",
          message: name + ' has a rating of ' + rating,
          iconUrl: "icon256.png"
        };
        c.notifications.create(Date.now() + 'test', opt, function(){
          // Not sure what we need this one for.
        });
      });

    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}
