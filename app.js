
var express = require('express');
var controllers = require('./controllers');
var http = require('http');
var resource = require('express-resource');

var app = express();

var config = require('./config').app(app, express);

//
// habilita:
//
// Cross-Origin Resource Sharing (CORS) e
// Preflight Request.
//
// http://enable-cors.org/
//
app.all('*', function(request, response, next) {
	if (request.method.toUpperCase() === 'OPTIONS') {
		response.writeHead('204', 'No Content',	{
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'access-control-allow-headers': 'content-type, accept',
			'access-control-max-age': 12, // secs
			'content-length': 0,
			'x-powered-by': 'urimed-middleware'
		});

		return response.end();
	}
	
	response.header('access-control-allow-origin', '*');
	response.header('access-control-allow-headers', 'x-requested-with');
	response.header('x-powered-by', 'urimed-middleware');
	
	next();
});

//
// Publishers
//
app.resource('publisher', require('./controllers/publisher'));

//
// Subscribers
//
app.resource('subscriber', require('./controllers/subscriber'));

//
// Inscribes
//
app.resource('contract', require('./controllers/contract'));

//
// Communicator
//
app.resource('communicator', require('./controllers/communicator'));

//
// Manager
//
app.resource('manager', require('./controllers/manager'));

//
// INDEX - Api reference
//
app.get('/', controllers.index);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
