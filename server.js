// # SimpleServer
var http = require('http');
var path = require('path');
var express = require('express');
// ## SimpleServer `SimpleServer(obj)`
// Creates a new instance of SimpleServer with the following options:
var router = express();

router.use('/',express.static(path.resolve(__dirname, '')));

router.use('/', function(req, res){
  res.sendFile(__dirname+'/oo-belege-erfassen/index.html');
});

//var server = http.createServer(router);
router.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
 // var addr = server.address();
  console.log("Server gestartet");
});
