'use strict';
const grpc = require('grpc');
const shortid = require('shortid');

const DEFAULT_PORT = 59123;


class ATServer {

    constructor(options) {
        this.port = options.port || DEFAULT_PORT;
        this.tokens = [];

        this.AfricasTalking = require('../index')(options);
        this.server = new grpc.Server();

        const services = [
            require('./account')(this)
        ];

        services.forEach((service) => this.server.addService(service.proto, service.impl));
    }

    start() {
        this.server.bind(this.port, grpc.ServerCredentials.createInsecure()); // FIXME: TLS
        this.server.start();
    }

    getATInstance() {
        return this.AfricasTalking;
    }

    authenticate(token) {
        return this.tokens.includes(token);
    }

    generateToken() {
        const token = shortid.generate();
        this.tokens.push(token);
        return token;
    }

    revokeToken(token) {
        if (this.authenticate(token)) {
            this.tokens.splice(this.tokens.indexOf(token), 1);
        }
    }
}

module.exports = exports = ATServer;
