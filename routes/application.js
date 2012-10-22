
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Application = require('../models/application.js').make(Schema, mongoose);

//
// list
//
exports.index = function(request, response) {
	response.contentType('application/json');
	
	Application.find({}, function (err, applicationResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {applications: applicationResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar as apps.'}});
		}
	});
};

//
// view
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.application) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else {
		Application.findById(request.params.application, function (err, applicationDb) {
			if (err) {
				response.send({status: {error: true, message: 'A app não pode ser localizada.'}});
			} else {
				var applicationReturn = new Application({
					description: applicationDb.description,
					address: applicationDb.address,
					active: applicationDb.active
				});
				
				response.send({status: {error: false, message: null}, data: {application: applicationReturn}});
			}
		});
	}
};

//
// add
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	var application = new Application({
		description: request.body.description,
		address: request.body.address,
		active: request.body.active
	});
	
	if (! application.description) {
		response.send({status: {error: true, message: 'A app não pode ser adicionanda. Informe a descrição da app.'}});
	} else if (application.description.length < 2) {
		response.send({status: {error: true, message: 'A app não pode ser adicionanda. A descrição da app é inválida.'}});
	} else {
		application.save(function(err, room) {
			if (err) {
				response.send({status: {error: true, message: 'A app não pode ser adicionanda. Erro no servidor.'}});
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
	
	if (request.body.address)
		update.address = request.body.address;
	
	if (request.body.active)
		update.active = request.body.active;
	
	if (! request.params.application) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else if (update.description && update.description.length < 2) {
		response.send({status: {error: true, message: 'A app não pode ser atualizado. A descrição da app é inválida.'}});
	} else {
		Application.findByIdAndUpdate(request.params.application, {$set: update}, function (err, applicationDb) {
			if (err) {
				response.send({status: {error: true, message: 'A app não pode ser localizado.'}});
			} else {
				var applicationReturn = new Application({
					description: applicationDb.description,
					address: applicationDb.address,
					active: applicationDb.active
				});
				
				response.send({status: {error: false, message: null}, data: {application: applicationReturn}});
			}
		});
	}
};

//
// delete
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.application) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else {
		Application.findByIdAndRemove(request.params.application, function (err, applicationDb) {
			if (err) {
				response.send({status: {error: true, message: 'A app não pode ser localizada.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};

