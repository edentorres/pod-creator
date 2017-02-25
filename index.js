
var http = require('http'),
    express = require('express');

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
	console.log('Request received.');
	console.log(req.body);

	var ref = req.param('ref', null);

	// TODO : replace by regex
	if (ref == 'refs/heads/master') {
		console.log('Master branch updated.');
		var version = req.param('version', null);
		if (!version) {
			res.json({'error': 'No v (version) parameter specified :('});
			return;
		} 
		var title = 'Creating pod for version ' + version;
    	res.send('<html><body><h>' + title + '</h></body></html>');
	} else {
		console.log('Pushed into ' + ref + ". No action required.");
	}
	
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});