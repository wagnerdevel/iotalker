
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Subscriber = require('../models/subscriber.js').make(Schema, mongoose);

//
// list
//
exports.index = function(request, response) {
	response.contentType('application/json');
	
	Subscriber.find({}, function (err, subscribersResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {subscribers: subscribersResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar os assinantes.'}});
		}
	});
};

//
// view
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.subscriber) {
		response.send({status: {error: true, message: 'Informe a key do assinante.'}});
	} else {
		Subscriber.findById(request.params.subscriber, function (err, subscriberDb) {
			if (err) {
				response.send({status: {error: true, message: 'O assinante não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {subscriber: subscriberDb}});
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
	
	var subscriber = new Subscriber({
		description: request.body.description,
		domain: request.body.domain,
		port: request.body.port || 80,
		path: request.body.path,
		method: request.body.method || 'POST',
		active: request.body.active || true
	});
	
	if (! subscriber.description) {
		response.send({status: {error: true, message: 'O assinante não pode ser adicionando. Informe a descrição.'}});
	} else if (! subscriber.domain) {
		response.send({status: {error: true, message: 'O assinante não pode ser adicionando. O domínio é inválido.'}});
	} else if (! subscriber.path) {
		response.send({status: {error: true, message: 'O assinante não pode ser adicionando. O path é inválido.'}});
	} else {
		subscriber.save(function(err, room) {
			if (err) {
				response.send({status: {error: true, message: 'O assinante não pode ser adicionando. Erro no servidor.'}});
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
	
	if (! request.params.subscriber) {
		response.send({status: {error: true, message: 'Informe a key do assinante.'}});
	} else if (update.description && update.description.length < 2) {
		response.send({status: {error: true, message: 'O assinante não pode ser atualizado. A descrição é inválida.'}});
	} else {
		Subscriber.findByIdAndUpdate(request.params.subscriber, {$set: update}, function (err, subscriberDb) {
			if (err) {
				response.send({status: {error: true, message: 'O assinante não pode ser localizado.'}});
			} else {
				
				/*
				 * TO-DO: atualizar os assinantes que estao na queue;
				 */
				
				response.send({status: {error: false, message: null}, data: {subscriber: subscriberDb}});
			}
		});
	}
};

//
// delete
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.subscriber) {
		response.send({status: {error: true, message: 'Informe a key do assinante.'}});
	} else {
		Subscriber.findByIdAndRemove(request.params.subscriber, function (err, subscriberDb) {
			if (err) {
				response.send({status: {error: true, message: 'O assinante não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};
