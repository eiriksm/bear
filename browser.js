/*global chrome, require */
/* eslint no-console: 0 */

(function() {
  var config;
  try {
    config = require('./config');
  }
  catch (err) {
    console.log(err);
    config = {};
  }
  'use strict';
  require('./source')(chrome, config);
}());
