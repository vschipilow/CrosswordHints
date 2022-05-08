
"use strict";

const server = require('./xWordHintsServer.jsx');
const http = require('http');

var systemPort = process.env['WEB_APP_PORT'];
var iPhone = (systemPort != null);
var port = iPhone ? systemPort : 8081;

console.log(port);

http.createServer( (req, res) => {
    server.processRequest(req, res, port, iPhone);
}).listen(port);
