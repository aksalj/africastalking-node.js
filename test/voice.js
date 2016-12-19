'use strict';

var should = require('should');
var fixtures = require('./fixtures');

var AfricasTalking, voice;

describe('Voice', function () {
    this.timeout(5000);

    before(function () {
        AfricasTalking = require('../lib')(fixtures.TEST_ACCOUNT);
        voice = AfricasTalking.VOICE;
    });

    describe('initiates a phone call', function (done) {

    });


    it('builds proper voice xml', function (done) {


    });


});
