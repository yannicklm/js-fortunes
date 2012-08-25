var http = require('http');
var querystring  =  require('querystring');


if (process.argv.length < 3) {
  console.log("Usage: js-get HOST [CATEGORY]");
  process.exit(2);
}

var host = process.argv[2];
var category = process.argv[3];


if (category) {
  var query  = "?" + querystring.stringify({'category' : category});
} else {
  var query = ""
}
var options = {
    host: host,
    port: 8080,
    path: "/get" + query,
    method: 'GET'
  };

var req = http.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    console.log(chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.end();
