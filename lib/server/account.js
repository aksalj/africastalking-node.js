'use strict';
const path = require('path');
const grpc = require('grpc');

const fd = grpc.load(path.join(__dirname, './proto/com/africastalking/RemoteAccount.proto'));

let server = null;

const getUser = (call, callback) => {
    const req = call.request;
    const authenticated = server.authenticate(req.token.getId());
    if (!authenticated) {
        callback(new Error('Authenticated'));
        return;
    }

    const AT = server.getATInstance();
    AT.fetchAccount()
        .then((resp) => {
            callback(null, { response: JSON.stringify(resp) });
        }).catch((ex) => callback(ex));
};

module.exports = (instance) => {
    server = instance;
    return {
        proto: fd.RemoteAccount.service,
        impl: {
            getUser,
        }
    };
};
