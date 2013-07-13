#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://intense-badlands-6076.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(val) {    
	return val.toString();
}

var cheerioHtmlFile = function(htmlfile) {
//    return cheerio.load(fs.readFileSync(htmlfile));
	return cheerio.load(htmlfile);
};

var cheerioUrl = function (htmlfile){
	return cheerio.load(htmlfile);
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

/*var cheerioURLFile = function(url_name, checksfile,  callback) {
    var instr=url_name.toString();   //redudant 
//$ = cheerioHtmlFile(htmlfile);
    rest.get(instr).on('complete', function(result) {
        if (result instanceof Error) {
            console.log("%s cannot be found: %s", instr, result.message);
            process.exit(1);
        }
        else {
            console.log('$ is about to be called');
            callback(result);
            console.log('$ is called, so continue to next section');
        }
        var checks=loadChecks(checksfile).sort();
        var out={};
        for (var ii in checks) {
            var present=$(checks[ii]).length>0;
            out[checks[ii]]=present;
        }
        return out;
    });
};*/

/*var checkURL = function(url_name, checksfile) {
    $ = cheerioURLFile(url_name, checksfile, function (result) {console.log(result);});
    console.log('$ is being called');                 
};*/

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'URL to check', clone(assertUrlExists), URL_DEFAULT)
        .parse(process.argv);
	var checkJson, outJson;
	if (program.url) {
	    rest.get(program.url).on('complete', function(result) {
		checkJson = checkHtmlFile(result, program.checks);
		console.log(result);
		outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    });
	} else {
	    checkJson = checkHtmlFile(program.file, program.checks);
	    console.log(program.file);
	    outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
