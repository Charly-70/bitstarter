var express = require('express');
var fs = require ('fs');
var htmlfile = "index.html";


var app = express.createServer(express.logger());


//var buf = new Buffer( fs.readFileSync('index.html') );

app.get('/', function(request, response) {
  //response.send('Hello World 2!');
  // response.send( buf.toString() );
    var html = fs.readFileSync(htmlfile).toString();
    response.send(html);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
