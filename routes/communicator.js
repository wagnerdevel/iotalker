
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Application = require('../models/application.js').make(Schema, mongoose);
var Queue = require('../models/queue.js').make(Schema, mongoose, Application);
var Inscribe = require('../models/inscribe.js').make(Schema, mongoose);

//
// add
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	Inscribe.find({sensor_id: request.body.id}, function (err, inscribeApplications) {
		if (! err && inscribeApplications.length > 0) {
			var queue = new Queue({
				sensor_id: request.body.id,
				datetime: new Date(),
				data: request.body.data,
				ip: request.body.ip,
				applications: []
			});
			
			var appsId = [];
			
			inscribeApplications.forEach(function (inscribe) {
				appsId.push({_id: inscribe.app_id});
			});
			
			Application.find({$or:appsId}, function (errOnFind, application) {
				if (! errOnFind) {
					queue.applications.push(application);
					
					queue.save(function(errOnSave) {
						if (errOnSave) {
							response.send({status: {error: true, message: 'Não foi possível publicar a mensagem. Erro no servidor (1).'}});
						} else {
							response.send({status: {error: false, message: null}, data: {applications: appsId}});
						}
					});
				} else {
					response.send({status: {error: true, message: 'Não foi possível publicar a mensagem. Erro no servidor (2).'}});
				}
			});
		} else {
			response.send({status: {error: false, message: 'Nenhuma aplicação assinante do sensor'}, data: {applications: []}});
		}
	});
};
