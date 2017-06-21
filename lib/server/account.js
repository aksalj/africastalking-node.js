'use strict';
var path = require('path');
var grpc = require('grpc');

var fd = grpc.load(path.join(__dirname, './proto/com/africastalking/RemoteAccount.proto'));
console.log(fd);

var RemoteAccount = fd.RemoteAccount;