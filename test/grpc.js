'use strict';

var should = require('should');
var validate = require('validate.js');
var fixtures = require('./fixtures.local');

describe('gRPC', function () {
    this.timeout(5000);

    it('starts server', function (done) {

        var ATServer = require('../lib/server');
        var server = new ATServer(fixtures.TEST_ACCOUNT);

    });   
});

