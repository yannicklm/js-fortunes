"use strict";
var http = require('http');
var querystring  =  require('querystring');

if (process.argv.length < 4) {
    console.log("Usage: js-add HOST CATEGORY TEXT");
    process.exit(2);
}

var host = process.argv[2];
var category = process.argv[3];
var text = process.argv[4];

var options = {
    host: host,
    port: 8080,
    path: "/add?" + querystring.stringify({'category' : category, 'text' : text}),
    method: 'POST'
};

var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log(chunk);
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

req.end();
