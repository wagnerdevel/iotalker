
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Inscribe = require('../models/inscribe.js').make(Schema, mongoose);

//
// list
//
exports.index = function (request, response) {
	response.contentType('application/json');
	
	Inscribe.find({}, function (err, inscribesResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {inscribes: inscribesResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar as assinaturas.'}});
		}
	});
};

//
// view
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.inscribe) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else {
		Inscribe.find({app_id: request.params.inscribe}, function (err, sensors) {
			if (err) {
				response.send({status: {error: true, message: 'O sensor não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {sensor: sensors}});
			}
		});
	}
};

//
// assinatura
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	var inscribe = new Inscribe({
		app_id: request.body.app_id,
		sensor_id: request.body.sensor_id
	});
	
	inscribe.save(function(err, room) {
		if (err) {
			response.send({status: {error: true, message: 'Não foi possível efetuar a assinatura. Erro no servidor.'}});
		} else {
			response.send({status: {error: false, message: null}, data: {key: room.id}});
		}
	});
};

//
// desinscrição (get:app_id,post:sensor_id)
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.inscribe) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else if (! request.body.sensor_id) {
		response.send({status: {error: true, message: 'Informe a key do sensor.'}});
	} else {
		Inscribe.remove({app_id: request.params.inscribe, sensor_id: request.body.sensor_id}, function (err, sensorDb) {
			if (err) {
				response.send({status: {error: true, message: 'Não foi possivel desinscrever do sensor. Não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};
