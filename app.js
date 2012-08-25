var databaseUrl = "mydb";
var collections = ["fortunes", "categories"]
var db = require("mongojs").connect(databaseUrl, collections);
var url = require('url');
var http = require('http');

function randChoice(l) {
    return l[Math.floor(Math.random() * l.length)];
}


function serveText(response, text) {
  response.writeHead(200, {'Content-Type' :  'text/plain'});
  response.end(text + "\n");
}

function serveError(response, text) {
  console.log(text)
  response.writeHead(500);
  response.end(text);
}

function serveBadRequest(response, text) {
  console.log(text)
  response.writeHead(400);
  response.end(text + "\n");
}

function serve404(response) {
  response.writeHead(404);
  response.end();
}


function dispatch(request, response) {
  if (request.url.match("^/get")) {
    return get(request, response);
  }
  if (request.url.match("^/add")) {
    return add(request, response)
  }
  serve404(response);
}


function get(request, response) {
  var parsed = url.parse(request.url, true);
  var category = parsed['query']['category']
  if (category == undefined) {
    db.categories.find(function(err, categories) {
      if(err) {
        serveError(response, err);
        return;
      }
      if (categories.length === 0) {
        serveError(response, "No fortune yet");
        return;
      }
      category = randChoice(categories).name;
      dbGet(response, category);
    });
  } else {
    dbGet(response, category);
  }
}


function dbGet(response, category) {
  db.fortunes.find({'category': category}, function(err, fortunes) {
    if (err) {
      serveError(response, err);
      return;
    }
    if (fortunes.length === 0) {
      serveError(response, "No fortune matching category: " + category);
      return;
    }
    var fortune = randChoice(fortunes);
    serveText(response, fortune.text +  "\n" + fortune.category);
    });
}


function add(request, response) {
  if (request.method != "POST") {
    serveBadRequest(response, "Bad method");
    return;
  }
  var parsed = url.parse(request.url, true);
  var category = parsed['query']['category']
  var text = parsed['query']['text']
  if (category == undefined) {
    serveBadRequest(response, "Bad request: missing category parameter");
    return;
  }
  if (text == undefined) {
    serveBadRequest(response, "Bad request: missing text parameter");
    return;
  }

  db.fortunes.save({'category' : category, 'text' : text}, function(err, saved) {
    if (err || !saved) {
      serveError(response, "fortune not saved ");
      return;
    }
    addCategory(response, category);
  });

}

function addCategory(response, category) {
  db.categories.save({'name' : category}, function(err, saved) {
    if(err || !saved) {
      serveError(response, "fortune not saved " + err);
      return;
    }
    serveText(response, "fortune added");
  });
}



http.createServer(function (request, response) {
    dispatch(request, response)
}).listen(8081);

console.log('Server runnning at http://localhost:8081');
