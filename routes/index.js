
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Application = require('../models/application.js').make(Schema, mongoose);
var Queue = require('../models/queue.js').make(Schema, mongoose, Application);
var Inscribe = require('../models/inscribe.js').make(Schema, mongoose);

/*
 * GET home page.
 */

exports.index = function(request, response) {
	response.contentType('application/json');
	
	//
	// busca todos as apps:
	//
	
	var sensorId = '50847d7f687f4f6c2a000002';
	
	Inscribe.find({sensor_id: sensorId}, function (err, inscribeApplications) {
		if (! err && inscribeApplications.length > 0) {
			var queue = new Queue({
				sensor_id: "sensor-id",
				datetime: Date,
				data: {temperatura:2.0},
				ip: "192.168.0.78",
				applications: []
			});
			
			inscribeApplications.forEach(function (inscribe) {
				Application.findById(inscribe.app_id, function (err, application) {
					if (! err) {
						console.log(inscribe.app_id);
						queue.applications.push({a:2});
					}
				});
			});
			
			response.send({status: {error: false, message: null}, data: {sensor: queue}});
		}
	});
	
	/*
	Application.find({}, function (err, applicationResult) {
		if (! err) {
			var queue = new Queue({
				sensor_id: "sensor-id",
				datetime: Date,
				data: {temperatura:2.0},
				ip: "192.168.0.78",
				applications: []
			});
			
			var a = 1;
			
			Application.find({}, function (err, application) {
				if (! err) {
					a = 2;
					queue.applications.push(application);
				} else {
					a = 3;
				}
				console.log(a);
			});
			console.log(a);
			
//			queue.applications.push({testea:'ok'});
			
			response.send({status: {error: false, message: null}, data: {'queue': queue}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar as apps.'}});
		}
	});
	  */
	//request.render('index', {title: 'urimed-middleware'});
	
};
