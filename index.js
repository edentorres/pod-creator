var http = require('http'),
	https   = require('https'),
    express = require('express'),
    readline  = require('readline'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    nodeGit = require('nodegit'),
    clone = require('git-clone');

var repositoryUrl = 'https://github.com/mercadopago/px-ios.git';
var tempPath = 'tmp-px-ios';
var app = express();
var podspecFile = 'MercadoPagoSDK.podspec';
app.use(express.bodyParser());
app.set('port', process.env.PORT || 3000); 

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

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

	var id = "refs/heads/master";
	var isMasterRef = new RegExp(id+"$")
	
	if (isMasterRef.test(ref)) {
		res.json({'message': 'Master updated. Verify logs for pod creation'});
		
		// 1. get github repo
		getGithubRepo()
		.then(function (res){
    		console.log("Clone complete!");	

    		// 2. get podspec version
			extractPodVersionFromPodspec()
			.then(function(version){
				if (!version) {
					console.log("ERROR : no version found! :(");						
					return;
				} 

     			// 3. run script
     			spawn('sh', ['createPod.sh', version], {stdio: 'inherit'});
     			return;
			});
  		});
		
	} else {
		console.log('Pushed into ' + ref + '. No action required.');	
		res.json({'message': 'Pushed into ' + ref + '. No action required.'});
	}
	return;
});

function extractPodVersionFromPodspec(){
	return new Promise(function (complete, error){
		readline.createInterface({
    		input     : fs.createReadStream(tempPath + '/' + podspecFile),
    		terminal  : true
  		}).on('line', function(line) {
    		var idx = line.indexOf("s.version");
    		if (idx != -1 && idx < 5) {
    			line = line.replace(/\s+/g, '');
    			var vBeggining = line.lastIndexOf("=")+2;
				var vEnding = line.length-1;
      			var version = line.substring(vBeggining,vEnding);
				console.log("Version " + version + " found");
				complete(version);
    	}}).on('close', function() {
    		//readline.close();
 		}).on('error', function() {
    		console.log("Error extracting pod version :'(");	
    		error()
 		});
	});	
}

var cloneOpts = {
	checkoutBranch : 'master',
  	fetchOpts: {
    	callbacks: {
    		certificateCheck: function() { return 1; },
      		credentials: function(url, userName) {
        		return nodeGit.Cred.sshKeyFromAgent(userName);
      		}
    	}
  	}
};

function getGithubRepo() {
	return new Promise(function (complete, error){
		if (fs.existsSync(tempPath)) {
			fs.unlinkSync(tempPath);
		}

		nodeGit.Clone(repositoryUrl, 
			'./' + tempPath,
			cloneOpts)
  		.then(function(repo) {
			console.log("Repository Cloned Successfully!");	
			complete();
		}).catch(function(err) {
			console.log("Error cloning repo : " + err);	
		});
		// clone(repositoryUrl, 
		// 	'./tmp-px-ios', {
		// 	checkout: 'master' },
		// 	function(err) {
		// 		if (err) {
		// 			console.log("Error cloning repo : " + err);	
		// 			error(err);
		// 		} else {
		// 			complete();
		// 		} 
		// 	}).catch(function (err) {
		// 		console.log("Error cloning repo : " + err);	
		// 		error(err)
		// 	});
	});
}

var MY_SLACK_WEBHOOK_URL = 'https://paymentexperience.slack.com/services/hooks/incoming-webhook?token=myToken';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);