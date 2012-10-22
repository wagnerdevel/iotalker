
var express = require('express');
var routes = require('./routes');
var http = require('http');
var resource = require('express-resource');

var app = express();

var config = require('./config').app(app, express);

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
// INDEX - Api reference
//
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
