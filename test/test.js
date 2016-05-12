'use strict';
var middleware = require('../middleware');

before(function (done) {
  this.timeout(10000);
  middleware.db.initdb(done);
  done();
});

after(function () {
  // place holder
});

require('./api/order.test')();
require('./api/orderInternal.test')();
require('./api/delivery.test')();
require('./api/system.test')();
