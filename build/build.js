#! /usr/bin/env node

var fs = require("fs"),
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify;

String.prototype.startsWith = function (str){
	return this.indexOf(str) === 0;
};

var srcDir = '../src', targetDir = '../dist', allJsMap = {}, allMinJsMap = {};
var files = fs.readdirSync(srcDir);
files.forEach(function(file) { 
	if (file.charAt(0) == ".") return;
	var srcPath = srcDir + '/' + file, 
		targetPath = targetDir + '/' + file.replace('.js', '.min.js');
	var js = fs.readFileSync(srcPath).toString('utf-8');
	var ast = jsp.parse(js);
	ast = pro.ast_mangle(ast);
	ast = pro.ast_squeeze(ast);
	var minJs = pro.gen_code(ast); 
	console.log("writing " + file);
	if (file.startsWith("jquip") && !file.startsWith("jquip.q-"))
	{
		allJsMap[file] = js;	
		allMinJsMap[file] = minJs;	
	}
	fs.writeFileSync(targetPath, minJs);
});


var topFile = 'jquip.js';

//write /dist/jquip.all.js
var allJs = allJsMap[topFile] + ";";
for (var file in allJsMap) {
	if (file == topFile) continue;
	allJs += allJsMap[file] + ";";
}
fs.writeFileSync(targetDir + '/jquip.all.js', allJs);

//write /dist/jquip.all.min.js
var allMinJs = allMinJsMap[topFile] + ";";
for (var file in allMinJsMap) {
	if (file == topFile) continue;
	allMinJs += allMinJsMap[file] + ";";
}
fs.writeFileSync(targetDir + '/jquip.all.min.js', allMinJs);
