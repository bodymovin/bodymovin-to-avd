# bodymovin-to-avd
Bodymovin to AVD converter

#Example of usage
````javascript
var avd_converter = require('./src/index.js');
var fs = require('fs');

fs.readFile("./exports/jsons/data.json",  "utf8",  function(error, data){
	process.on('unhandledRejection', function(err, promise) {
	    console.error('Unhandled rejection (promise: ', promise, ', reason: ', err, ').');
	});
	var prom = avd_converter(JSON.parse(data))
	prom.then(function(xml){
		fs.writeFile("./test.xml", xml, function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log("The file was saved!");
		}); 
	}).catch(function(err){
	 		console.log('catch');
 	});
	
})
````