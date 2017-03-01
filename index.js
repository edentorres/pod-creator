var http = require('http'),
	https   = require('https'),
    express = require('express'),
    readline  = require('readline'),
    spawn = require('child_process').spawn,
    fs = require('fs');

var app = express();
app.use(express.bodyParser());
app.set('port', process.env.PORT || 3000); 

app.get('/', function (req, res) {
	console.log('Invalid request received.');
	res.json({'error': 'invalid request. Type v param as version required'});
});

app.get('/healthcheck', function (req, res) {
	res.json({'message': 'Now i cant see,...i just stare...ooohhh, im still alive!'});
});


app.post('/create_pod', function (req, res) {
	console.log('Request received : ' + req.body);

	var ref = req.param('ref', null);

	// TODO : replace by regex
	if (ref == 'refs/heads/master') {
		var version = getPodVersion(function(version) {
			if (!version) {
				res.json({'error': 'No version parameter specified :('});
				return;
			} 
    		res.json({'message': 'Master updated. Creating pod version ' + version});
    		runCreatePodScript();
		});
		
	} else {
		console.log('Pushed into ' + ref + ". No action required.");
	}
	return;
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function getPodVersion(callback) {
	var options = {
	  hostname  : 'raw.githubusercontent.com',
  	  port      : 443,
  	  path      : '/mercadopago/px-ios/development/MercadoPagoSDK.podspec',
  	  method    : 'GET'
	};

	var file = fs.createWriteStream("podspec.temp");

	// TODO : no need to download file locally
	var req = https.request(options, function(res) {
  		console.log("statusCode: ", res.statusCode);
  		res.on('data', function(d) {
	  		file.write(d);
			extractPodVersionFromPodspec(callback);
  		});


	});
	req.end();

	req.on('error', function(e) {
  		console.error(e);
	});
	
}

function extractPodVersionFromPodspec(callback){
	readline.createInterface({
    	input     : fs.createReadStream("MercadoPagoSDK.podspec"),
    	terminal  : true
  	}).on('line', function(line) {
    	var idx = line.indexOf("s.version");
    	if (idx != -1 && idx < 5) {
    		var vBeggining = line.lastIndexOf("=")+3;
    		//TODO : version should be until new line - 2
			var vEnding = line.lastIndexOf("=")+8;
      		var version = line.substring(vBeggining,vEnding);
			console.log("Version " + version + " found");
			callback(version);
    	}
  	}).on('close', function() {
    	
  	});
}

function runCreatePodScript(){
	spawn('sh', ['createPod.sh'], {stdio: 'inherit'});
}
