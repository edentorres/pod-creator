var http = require('http'),
	https   = require('https'),
    express = require('express'),
    readline  = require('readline'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    clone = require('git-clone');

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

		
		// 1. get github repo
		// getGithubRepo().then(function (res){
  //   		console.log("Clone complete!");	

    		// 2. get podspec version
			extractPodVersionFromPodspec().then(function(version){
				if (!version) {
					res.json({'error': 'No version parameter specified :('});
					return;
				} 
    			res.json({'message': 'Master updated. Verify logs for pod creation with version ' + version});

    			// 3. run script
    			spawn('sh', ['createPod.sh', version], {stdio: 'inherit'});
    			return;
			});
  		// });
		
	} else {
		console.log('Pushed into ' + ref + ". No action required.");
	}
	return;
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function extractPodVersionFromPodspec(){
	return new Promise(function (complete, error){
		readline.createInterface({
    		input     : fs.createReadStream("tmp-px-ios/MercadoPagoSDK.podspec"),
    		terminal  : true
  		}).on('line', function(line) {
  			console.log(line);
    		var idx = line.indexOf("s.version");
    		if (idx != -1 && idx < 5) {
    			var vBeggining = line.lastIndexOf("=")+3;
    			//TODO : version should be until new line - 2
				var vEnding = line.lastIndexOf("=")+8;
      			var version = line.substring(vBeggining,vEnding);
				console.log("Version " + version + " found");
				complete(version);
    	}})
    	.on('close', function() {
    	
 		})
 		.on('error', function() {
    		
 		});

	});

	
}

function getGithubRepo() {
	return new Promise(function (complete, error){
		clone('git@github.com:mercadopago/px-ios.git', 
			'./tmp-px-ios', {
			checkout: 'master' },
			function(err) {
				if (err) error(err);
				else {
					complete();
				} 
			});
	});
	
}

