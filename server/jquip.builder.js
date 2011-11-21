#! /usr/bin/env node
var http = require('http');
var fs = require("fs");
var url = require("url");

var getExt = function(path) {
	return path.substring(path.lastIndexOf('.')+1);
};
String.prototype.startsWith = function (str){
	return this.indexOf(str) === 0;
};

var contentTypes = { "htm": "text/html", "js": "text/javascript", "gif": "image/gif" };

var srcDir = '../src', targetDir = '../dist';
var webFiles = fs.readdirSync(targetDir);
var staticFiles = {}, binaryFiles = {};
fs.readdirSync(srcDir).forEach(function(file) { 
	var filePath = srcDir + '/' + file;
	staticFiles["/" + file] = fs.readFileSync(filePath).toString('utf-8');
});
fs.readdirSync(targetDir).forEach(function(file) { 
	var filePath = targetDir + '/' + file;
	staticFiles["/" + file] = fs.readFileSync(filePath).toString('utf-8');
});
fs.readdirSync("./").forEach(function(file) {
	var isText = contentTypes[getExt(file)].indexOf("text") === 0;
	if (isText)
		staticFiles["/" + file] = fs.readFileSync(file).toString('utf-8');
	else 
		binaryFiles["/" + file] = file;
});

staticFiles["/"] = staticFiles["/default.htm"];

console.log("loaded: ", Object.keys(staticFiles));

var isCore = { "/jquip.js": true, "/jquip.min.js": true };

http.createServer(function (req, res) {
	var reqUrl = url.parse(req.url), path = reqUrl.pathname;
	var fileContents = staticFiles[path];

	if (fileContents) {
		var ext = path == "/" ? "htm" : getExt(path);
		var contentType = contentTypes[ext];
		res.writeHead(200, {'Content-Type': contentType });
		var isPlugin = ext == "js" && path.startsWith("/jquip.") && !isCore[path];
		if (isPlugin) {
			var coreJs = path.indexOf("min") != -1 
				? staticFiles["/jquip.min.js"]
				: staticFiles["/jquip.js"];
			fileContents = coreJs + ";" + fileContents;
		}

		res.end(fileContents);
	}
	else if (binaryFiles[path]) { //incase the website needs to
		var filePath = binaryFiles[path];
		fs.createReadStream(filePath, {
		  'bufferSize': 4 * 1024
		}).pipe(res);
	}
	else
	{
		var isDynamic = path.startsWith("/jquip.");
		if (isDynamic) {
			var parts = path.substring(1).split('.');
			var isMin = parts.indexOf("min") >= 0;
			var js = isMin ? staticFiles["/jquip.min.js"] : staticFiles["/jquip.js"];			
			parts.forEach(function(part){
				if (part == "jquip" || part == "min" || part == "js") return;
				var path = "/jquip." + part + (isMin ? ".min.js" : ".js");
				var jsFile = staticFiles[path];
				if (jsFile)
					js += ";" + jsFile;
			});
			res.writeHead(200, {'Content-Type': 'text/javascript' });
			res.end(js);		
			return;
		}

		res.writeHead(404, {'Content-Type': 'text/plain'});
		var sb = "";
		for (var i in reqUrl) {
			if (sb) sb += "\n";
			sb += i + ": " + reqUrl[i];
		}
		res.end(sb);
	}
})
.listen(90, "127.0.0.1");
console.log('Server running at http://127.0.0.1:90/');
