var should = require('should');

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
});
