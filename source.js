'use strict';
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var util = require('util');

var untappdSearch = require('./untappd');

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

function createNotification(text) {
  var opt = {
    type: "basic",
    title: "Ratings",
    iconUrl: "icon256.png",
    message: text
  };
  c.notifications.create(Date.now() + Math.random() + 'button', opt);
}

function onSelectionClick(info) {
  // Find selection text.
  var text = info.selectionText;
  // Post request to ratebeer.
  getBeer(text);
}

function getBeer(text) {
  var opts = url.parse('http://www.ratebeer.com/findbeer.asp?beername=' + text);
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
      $('.col-xl-offset-2 table tr').each(function(i, n) {
        var hasLinks = $(n).find('a');
        if (!hasLinks || !hasLinks.length) {
          // This is table header. Stupid markup.
          return;
        }
        var name = $(n).find('td:nth-child(1)').text().trim();
        var rating = $(n).find('td:nth-child(4)').text().trim();
        if (!rating) {
          return;
        }
        var buttons = [
          {title: 'Check on untappd'}
        ];
        var opt = {
          type: "basic",
          title: "Ratings",
          iconUrl: "icon256.png",
          message: name,
          contextMessage: "Rating: " + rating,
          buttons: buttons
        };
        c.notifications.create(Date.now() + Math.random() + 'button', opt, function(id) {
          var listener = function(notifId, btnIdx) {
            if (notifId === id) {
              untappdSearch({name: name}, function(e, r) {
                if (e) {
                  createNotification('Error occured. None found');
                  return;
                }
                if (!r || !r.response || !r.response.beers || !r.response.beers.count) {
                  createNotification('None found');
                  return;
                }
                r.response.beers.items.forEach(function(n) {
                  var nm = n.beer.beer_name;
                  var s = n.beer.beer_style;
                  var had = n.have_had;
                  var beerString = util.format('%s %s (%s)',
                                               n.brewery.brewery_name,
                                               nm,
                                               s);
                  if (had) {
                    createNotification('You have already had ' + beerString);
                  }
                  else {
                    createNotification('You have not had ' + beerString);
                  }
                });
              });
              chrome.notifications.onButtonClicked.removeListener(listener);
            }
          };
          chrome.notifications.onButtonClicked.addListener(listener);
        });
      });

    });
  });
  req.on('error', function(e) {
    createNotification('problem with request: ' + e.message);
  });
  req.end();
}
