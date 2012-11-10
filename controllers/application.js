
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
				response.send({status: {error: false, message: null}, data: {application: applicationDb}});
			}
		});
	}
};

//
// add
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	if (typeof request.body.active === 'string') {
		request.body.active = (request.body.active == 'false' ? false : true);
	}
	
	var application = new Application({
		description: request.body.description,
		domain: request.body.domain,
		port: request.body.port || 80,
		path: request.body.path,
		method: request.body.method || 'POST',
		active: request.body.active || true
	});
	
	if (! application.description) {
		response.send({status: {error: true, message: 'A app não pode ser adicionanda. Informe a descrição da app.'}});
	} else if (! application.domain) {
		response.send({status: {error: true, message: 'A app não pode ser adicionanda. O domínio da app é inválido.'}});
	} else if (! application.path) {
		response.send({status: {error: true, message: 'A app não pode ser adicionanda. O path da app é inválido.'}});
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
	
	if (request.body.domain)
		update.domain = request.body.domain;
	
	if (request.body.port)
		update.port = request.body.port;
	
	if (request.body.path)
		update.path = request.body.path;
	
	if (request.body.method)
		update.method = request.body.method;
	
	if (request.body.active) {
		if (typeof request.body.active === 'string') {
			request.body.active = (request.body.active == 'false' ? false : true);
		}
		
		update.active = request.body.active;
	}
	
	if (! request.params.application) {
		response.send({status: {error: true, message: 'Informe a key da app.'}});
	} else if (update.description && update.description.length < 2) {
		response.send({status: {error: true, message: 'A app não pode ser atualizado. A descrição da app é inválida.'}});
	} else {
		Application.findByIdAndUpdate(request.params.application, {$set: update}, function (err, applicationDb) {
			if (err) {
				response.send({status: {error: true, message: 'A app não pode ser localizado.'}});
			} else {
				
				/*
				 * TO-DO: atualizar as aplicacoes que estao na queue;
				 */
				
				response.send({status: {error: false, message: null}, data: {application: applicationDb}});
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
