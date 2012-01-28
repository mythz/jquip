#!/usr/bin/env node
var express = require('express'),
    app = express.createServer(),
    PORT = 8567;

function echo(req,res) {
  res.send({
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.rawBody
  });
  console.log(req.method);
}
app.configure(function(){
  app.use(express.static(__dirname + '/../../src'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.methodOverride());
  app.use (function(req, res, next) {
    if ('GET' == req.method || 'HEAD' == req.method) return next();
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { req.rawBody += chunk; });
    req.on('end', function() { next(); });
  });
});

app.get('/echo', echo);
app.put('/echo', echo);
app.post('/echo', echo);
app.delete('/echo', echo);

app.get('/', function(req,res){
  res.redirect('/test.html');
});
console.log('Listening on http://localhost:' + PORT);
app.listen(PORT);

