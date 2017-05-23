#!/usr/bin/env node
process.env.TZ = 'UTC';

require('dotenv').config();
const db = require('./db.js');
const http = require('http');

var handler = function (request, response) {

    switch (request.url) {

        case '/counter':
            handleCounterRequest(response);
            break;

        default:
            handleWelcome(response);
            break;
    }
};

function handleCounterRequest(response) {
    db.getMessage(function (err, message) {

        var responseObject = {
            lastId: message.id,
            lastMessageAt: message.created_at,
            time: new Date()
        };

        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(responseObject));
    });
}

function handleWelcome(response) {
    response.writeHead(404);
    response.end();
}

var server = http.createServer(handler);
server.listen(8861);
console.log("Server running at http://127.0.0.1:8861/");