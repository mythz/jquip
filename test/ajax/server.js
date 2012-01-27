#!/usr/bin/env node
var express = require('express'),
    app = express.createServer(),
    PORT = 8567;

function echo(req,res) {
  res.send({
    method: req.method,
    headers: req.headers,
    params: req.params,
    body: req.body
  });
}
app.configure(function(){
  app.use(express.static(__dirname + '/../../src'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.methodOverride());
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

