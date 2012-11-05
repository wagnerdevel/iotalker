
var express = require('express');
var routes = require('./routes');
var http = require('http');
var resource = require('express-resource');

var app = express();

var config = require('./config').app(app, express);

//
// Habilita:
// Cross-Origin Resource Sharing (CORS) e
// Preflight Request.
// http://enable-cors.org/
//
app.all('*', function(request, response, next) {
	if (request.method.toUpperCase() === 'OPTIONS') {
		response.writeHead(
			'204',
			'No Content',
			{
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'access-control-allow-headers': 'content-type, accept',
				'access-control-max-age': 10, // seconds.
				'content-length': 0,
				'x-powered-by': 'urimed-middleware'
			}
		);

		return response.end();
	}
	
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Headers', 'X-Requested-With');
	response.header('X-Powered-By', 'urimed-middleware');
	
	next();
});

//
// Sensor
//
app.resource('sensor', require('./routes/sensor'));

//
// Apps
//
app.resource('application', require('./routes/application'));

//
// Inscribes
//
app.resource('inscribe', require('./routes/inscribe'));

//
// Communicator
//
app.resource('communicator', require('./routes/communicator'));

//
// INDEX - Api reference
//
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
