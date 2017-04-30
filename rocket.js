
var config = {
    host: 'chat.claytrader.com',
    port: 3000,
    user: 'guest',
    password: 1,
    rooms: [
        "koC4ts9d67omHjMGJ",
        "X8u7sLxGFfecigSAD",
        "N9k7jfy3bJ86fk9Fh"
    ]
};

// rocketchat api wrapper
var RocketChatApi = require('rocketchat').RocketChatApi;
// alpha-api versions
var rocketChatApi = new RocketChatApi('http', config.host, config.port, config.user, config.password);

// direct access to new api
var RocketChatClient = require('rocketchat').RocketChatClient;

rocketChatApi.version(function (err, body) {
    if (err)
        console.log(err);
    else
        console.log(body);
});

