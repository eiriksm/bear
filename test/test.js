'use strict';
const path = require('path');
const fs = require('fs');

const PORT = 8899;

require('should');
var bear = require('../source');
let cb, data;
var chrome = {
  contextMenus: {
    create: function(obj) {
      cb = obj.onclick;
    }
  },
  notifications: {
    create: function(id, opt) {
      data = opt;
    }
  }
};

var added = [];
var removed = [];
let server = require('https').createServer({
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
}, function(req, res) {
  res.end('OK');
});

server.listen(PORT)

describe('Extension functionality', function() {
  it('Should not error when started', function() {
    bear(chrome);
  });
  it('Should search for something when triggered', function(done) {
    // Start it again, for coverage.
    bear(chrome);
    this.timeout(10000);
    cb({selectionText: 'beer'});
    var checkIfDone = function() {
      if (!data) {
        setTimeout(checkIfDone, 200);
        return;
      }
      data.type.should.equal('basic');
      data.title.should.equal('Ratings');
      done();
    };
    checkIfDone();
  });
  it('Should search for something on the tappd when triggered', function(done) {
    // Start it again, for coverage.
    data = undefined;
    bear(chrome, {
      untappdUrl: 'https://localhost:' + PORT
    });
    this.timeout(10000);
    cb({selectionText: 'beer'});
    chrome.notifications.create = function(id, opts, callback) {
      data = opts;
      callback();
    };
    chrome.notifications.onButtonClicked = {};
    chrome.notifications.onButtonClicked.removeListener = function(l) {
      removed.push(l);
    };
    chrome.notifications.onButtonClicked.addListener = function(l) {
      added.push(l);
    };
    var doneit = false;
    var checkIfDone = function() {
      if (!added.length || doneit) {
        setTimeout(checkIfDone, 200);
        return;
      }
      doneit = true;
      added[0]();
      data.type.should.equal('basic');
      data.title.should.equal('Ratings');
      done();
    };
    checkIfDone();
  });
});
