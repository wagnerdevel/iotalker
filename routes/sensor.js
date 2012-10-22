
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Sensor = require('../models/sensor.js').make(Schema, mongoose);

//
// list
//
exports.index = function(request, response) {
	response.contentType('application/json');
	
	Sensor.find({}, function (err, sensorsResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {sensors: sensorsResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar os sensores.'}});
		}
	});
};

//
// view
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.sensor) {
		response.send({status: {error: true, message: 'Informe a key do sensor.'}});
	} else {
		Sensor.findById(request.params.sensor, function (err, sensorDb) {
			if (err) {
				response.send({status: {error: true, message: 'O sensor não pode ser localizado.'}});
			} else {
				var sensorReturn = new Sensor({
					description: sensorDb.description,
					status: sensorDb.status,
					active: sensorDb.active
				});
				
				response.send({status: {error: false, message: null}, data: {sensor: sensorReturn}});
			}
		});
	}
};

//
// add
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	var sensor = new Sensor({
		description: request.body.description,
		status: request.body.status,
		active: request.body.active
	});
	
	if (! sensor.description) {
		response.send({status: {error: true, message: 'O sensor não pode ser adicionando. Informe a descrição do sensor.'}});
	} else if (sensor.description.length < 2) {
		response.send({status: {error: true, message: 'O sensor não pode ser adicionando. A descrição do sensor é inválida.'}});
	} else {
		sensor.save(function(err, room) {
			if (err) {
				response.send({status: {error: true, message: 'O sensor não pode ser adicionando. Erro no servidor.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {key: room.id}});
			}
		});
	}
};

//
// edit
//
exports.update = function(request, response) {
	response.contentType('application/json');
	
	var update = {};
	
	if (request.body.description)
		update.description = request.body.description;
	
	if (request.body.status)
		update.status = request.body.status;
	
	if (request.body.active)
		update.active = request.body.active;
	
	if (! request.params.sensor) {
		response.send({status: {error: true, message: 'Informe a key do sensor.'}});
	} else if (request.body.description && update.description.length < 2) {
		response.send({status: {error: true, message: 'O sensor não pode ser atualizado. A descrição do sensor é inválida.'}});
	} else {
		Sensor.findByIdAndUpdate(request.params.sensor, {$set: update}, function (err, sensorDb) {
			if (err) {
				response.send({status: {error: true, message: 'O sensor não pode ser localizado.'}});
			} else {
				var sensorReturn = new Sensor({
					description: sensorDb.description,
					status: sensorDb.status,
					active: sensorDb.active
				});
				
				response.send({status: {error: false, message: null}, data: {sensor: sensorReturn}});
			}
		});
	}
};

//
// delete
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.sensor) {
		response.send({status: {error: true, message: 'Informe a key do sensor.'}});
	} else {
		Sensor.findByIdAndRemove(request.params.sensor, function (err, sensorDb) {
			if (err) {
				response.send({status: {error: true, message: 'O sensor não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};
