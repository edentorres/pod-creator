
var http = require('http'),
    express = require('express');

var app = express();
app.set('port', process.env.PORT || 3000); 

app.get('/', function (req, res) {
	console.log('Invalid request received.');
	res.json({'error': 'invalid request. Type v param as version required'});
});

app.get('/create_pod', function (req, res) {
	console.log('Request received.');
	var version = req.query.v;
	if (!version) {
		res.json({'error': 'No v (version) parameter specified :('});
		return;
	} 
	var title = 'Creating pod for version ' + version;
    res.send('<html><body><h>' + title + '</h></body></html>');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});