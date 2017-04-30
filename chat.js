#!/usr/bin/env node
process.env.TZ = 'UTC';

require('dotenv').config();

const fs = require('fs');
var util = require('util');
const mysql = require('mysql');
const socket = require('ws');

const ws = new socket(process.env.SOCKET);

var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database connected");
    } else {
        console.log("Error connecting database: " + err.message);
    }
});

ws.on('open', function open() {
    console.log('Socket connected');
    login(ws);
});

ws.on('close', function (port, msg) {
    console.log('Socket closed: ' + msg);
});

ws.on('message', function incoming(data, flags) {
    //console.log(new Date() + " message: ", data);
    log_file.write(util.format(data) + '\n');
    handleIncomingMessage(parse(data));
});

function login(ws) {
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

    return message.msg.fields.args !== undefined;
}

function parseChatMessage(message) {
    args = message.fields.args;

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

    connection.query('INSERT INTO message SET ?', message, function (err, res) {

        if (err) {
            console.log('Error while inserting: ' + err.message);
            return;
        }

        console.log('Last insert ID:', res.insertId);
    });
}

function sendObject(obj) {
    var payload = [JSON.stringify(obj)];
    ws.send(JSON.stringify(payload));
}