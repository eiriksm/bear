'use strict';
require('should');

var bear = require('../source');
var cb, data;
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
    bear(chrome);
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
