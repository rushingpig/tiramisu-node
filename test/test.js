'use strict';
var middleware = require('../middleware');

before(function (done) {
  this.timeout(10000);
  middleware.db.initdb(done);
});

after(function () {
  // place holder
});

require('./api/order.test')();
require('./api/delivery.test')();
