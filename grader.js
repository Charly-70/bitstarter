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

 + Further references.

   - https://github.com/danwrong/restler

*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://dry-shelf-1803.herokuapp.com";

// check if the file actually exists.  Throw an error if not.
var assertFileExists = function(infile) {
    var instr = infile.toString(); // name of the file as a string
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};



// Load an HTML file
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};



// Check html data.  Shared by file or URL data source.  
//helper function
var checkHtmlData = function( html, checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = html(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};



// Output the results
// Helper function. Is able to reach the variables from the calling funtion
var outputResult = function( checkJson ){
    var outJson = JSON.stringify(checkJson, null, 4); // format the result in JSON style
    console.log(outJson); // log the json result in the console
    return 1;
};



// Check the html file using a file as source
var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    return checkHtmlData($, checksfile);
};



// Callback when the URL has loaded
var onURLComplete = function (data){
    if (data instanceof Error) {
	console.log('Error: ' + data.message);
	console.log("Exiting now");
	process.exit(1);
    } else {
	$ = cheerio.load(data);
	var checkJson = checkHtmlData($, program.checks); // get the result
	var outputURLResult = outputResult( checkJson ); // the original variable name was already set in the main, so I changed the name
	//    console.log("ok post outputResult");
    }
};



// the url pased as a parameter arrives here...
var getURLInfo = function(urlAdress) {
    rest.get(urlAdress).on('complete', onURLComplete);
    useAFile = false; // we wont use a file as a source any more
};



var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};



// Main
if(require.main == module) {
    var useAFile = true;

    program // this is how commander extension uses the arguments used when starting the program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT) // json file including what to check
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT) // html file that is gonna be checked
	.option('-u, --url <url>', 'URL with the .html to analize', clone(getURLInfo), URL_DEFAULT)  // alternativelly, use an URL to check its html
	.parse(process.argv);

//    How do look the arguments of the main function? lets check
//    console.log("Process.argv are:");
//    console.log(process.argv);
//    console.log("\nNormal output:");

    if ( useAFile ) {
	// Once the arguments have been checked.
	var checkJson = checkHtmlFile(program.file, program.checks); // get the json result
	var outputResult = outputResult( checkJson );
	//console.log("Done the file version Analisis\n");
    }


// Original
//    var checkJson = checkHtmlFile(program.file, program.checks); // get the json result
//    var outJson = JSON.stringify(checkJson, null, 4); // format the result
//    console.log(outJson); // log the json result in the console


} else {
    exports.checkHtmlFile = checkHtmlFile;
}
