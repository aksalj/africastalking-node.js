const should = require('should'); // eslint-disable-line
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

    it('generates, authenticates and revokes tokens', (done) => {
        const token = server.generateToken();
        token.should.be.a.string();
        const valid = server.authenticate(token);
        valid.should.be.exactly(true);
        server.revoke(token);
        const invalid = server.authenticate(token);
        invalid.should.be.exactly(false);
        done();
    });

    it('has an instance of the lib', (done) => {
        const p = server.getATInstance().fetchAccount();
        validate.isPromise(p).should.be.exactly(true);

        p.then((resp) => {
            resp.should.have.property('UserData');
            done();
        }).catch((error) => {
            console.log(error);
            done();
        });
    });
});

