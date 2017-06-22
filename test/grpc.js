'use strict';

const should = require('should');
const validate = require('validate.js');
const fixtures = require('./fixtures.local');
const ATServer = require('../lib/server');

describe('gRPC', function () {
    this.timeout(5000);
    let server = null;

    before(() => {
        server = new ATServer(fixtures.TEST_ACCOUNT);
        server.start();
    });

    it('generates, authenticates and revokes tokens', function (done) {
        const token = server.generateToken();
        token.should.be.a.string();
        const valid = server.authenticate(token);
        valid.should.be.exactly(true);
        server.revoke(token);
        const invalid = server.authenticate(token);
        invalid.should.be.exactly(false);
    });

    it('has an instance of the lib', function (done) {
        var p = server.getATInstance().fetchAccount();
        validate.isPromise(p).should.be.exactly(true);

        p.then(function (resp) {
            resp.should.have.property('UserData');
            done();

        }).catch(function (error) {
            console.log(error);
            done();
        });
    });   
});

