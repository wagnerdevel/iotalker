
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Publisher = require('../models/publisher.js').make(Schema, mongoose);

//
// list
//
exports.index = function(request, response) {
	response.contentType('application/json');
	
	Publisher.find({}, function (err, publishersResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {publishers: publishersResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar os publicadores.'}});
		}
	});
};

//
// view
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.publisher) {
		response.send({status: {error: true, message: 'Informe a key do publicador.'}});
	} else {
		Publisher.findById(request.params.publisher, function (err, publisherDb) {
			if (err) {
				response.send({status: {error: true, message: 'O publicador não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {publisher: publisherDb}});
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
	
	var publisher = new Publisher({
		description: request.body.description,
		status: request.body.status,
		active: request.body.active
	});
	
	if (! publisher.description) {
		response.send({status: {error: true, message: 'O publicador não pode ser adicionando. Informe a descrição.'}});
	} else if (publisher.description.length < 2) {
		response.send({status: {error: true, message: 'O publicador não pode ser adicionando. A descrição é inválida.'}});
	} else {
		publisher.save(function(err, room) {
			if (err) {
				response.send({status: {error: true, message: 'O publicador não pode ser adicionando. Erro no servidor.'}});
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
	
	if (request.body.active) {
		if (typeof request.body.active === 'string') {
			request.body.active = (request.body.active == 'false' ? false : true);
		}
		
		update.active = request.body.active;
	}
	
	if (! request.params.publisher) {
		response.send({status: {error: true, message: 'Informe a key do publicador.'}});
	} else if (request.body.description && update.description.length < 2) {
		response.send({status: {error: true, message: 'O publicador não pode ser atualizado. A descrição é inválida.'}});
	} else {
		
		//
		// editar tambem em queue
		//
		
		Publisher.findByIdAndUpdate(request.params.publisher, {$set: update}, function (err, publisherDb) {
			if (err) {
				response.send({status: {error: true, message: 'O publicador não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {publisher: publisherDb}});
			}
		});
	}
};

//
// delete
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.publisher) {
		response.send({status: {error: true, message: 'Informe a key do publicador.'}});
	} else {
		
		//
		// remover tambem em inscribe e queue
		//
		
		Publisher.findByIdAndRemove(request.params.publisher, function (err) {
			if (err) {
				response.send({status: {error: true, message: 'O publicador não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};
