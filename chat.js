#!/usr/bin/env node
process.env.TZ = 'UTC';

require('dotenv').config();
const db = require('./db.js');
const fs = require('fs');
const util = require('util');
const Socket = require('ws');
const ws = new Socket(process.env.SOCKET);

var log_file = fs.createWriteStream(__dirname + '/logs/debug.log', {flags: 'w'});

ws.on('open', function open() {
    console.log('Socket connected');
    login();
});

ws.on('close', function (port, msg) {
    console.log('Socket closed: ' + msg);
});

ws.on('message', function incoming(data, flags) {
    //console.log(new Date() + " message: ", data);
    log_file.write(util.format(data) + '\n');
    handleIncomingMessage(parse(data));
});

function login() {
    var initFrames = JSON.parse(fs.readFileSync('login.json', 'utf8'));

    initFrames.forEach(function (frame) {
        sendObject(frame);
    });

    console.log('Logged in');
}

function handleIncomingMessage(message) {

    if (isPing(message)) {
        sendPong();
        process.stdout.write(".")
    }

    if (isChatMessage(message)) {
        console.log(new Date() + "New message: ", message);
        recordMessage(parseChatMessage(message));
    }
}

function parse(message) {

    if (message.startsWith("a")) {
        var array = JSON.parse(message.substring(1))
        return JSON.parse(array[0]);
    }

    return message;
}

function isPing(message) {
    return message.msg === 'ping';
}

function sendPong() {
    sendObject({
        msg: "pong"
    });
}

function isChatMessage(message) {
    if (message.msg !== 'changed') {
        return false;
    }

    if (message.collection !== 'stream-room-messages') {
        return false;
    }

    return message.fields.args !== undefined;
}

function parseChatMessage(message) {
    var args = message.fields.args[0];

    return {
        room_id: args.rid,
        author: args.u.username,
        body: args.msg,
        received_at: new Date(),
        created_at: new Date(args.ts.$date)
    }
}

function recordMessage(message) {
    console.log("new chat: " + JSON.stringify(message));

    db.saveMessage(message, function (err, result) {
        if (err) {
            console.log('error saving message: ' + err.toString());
        }
    });
}

function sendObject(obj) {
    var payload = [JSON.stringify(obj)];
    ws.send(JSON.stringify(payload));
}