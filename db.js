const mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.saveMessage = function (message, callback) {

    pool.getConnection(function (err, connection) {

        if (err) {
            console.log(err);
            callback(true);
            return;
        }

        connection.query('INSERT INTO message SET ?', message, function (err, results) {

            connection.release(); // always put connection back in pool after last query

            if (err) {
                console.log(err);
                callback(true);
                return;
            }

            callback(false, results);
        });

    });
};

exports.getMessage = function (callback) {

    pool.getConnection(function (err, connection) {

        if (err) {
            console.log(err);
            callback(true);
            return;
        }

        connection.query('SELECT * FROM message ORDER BY id DESC LIMIT 1;', null, function (err, results) {

            connection.release(); // always put connection back in pool after last query

            if (err) {
                console.log(err);
                callback(true);
                return;
            }

            callback(false, results[0]);
        });

    });
};


