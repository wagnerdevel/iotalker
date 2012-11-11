
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Contract = require('../models/contract.js').make(Schema, mongoose);

//
// list
//
exports.index = function (request, response) {
	response.contentType('application/json');
	
	Contract.find({}, function (err, contractsResult) {
		if (! err) {
			response.send({status: {error: false, message: null}, data: {contract: contractsResult}});
		} else {
			response.send({status: {error: true, message: 'Não foi possível listar os contratos de assinaturas.'}});
		}
	});
};

//
// view (retorna todas os assinantes um determinado publicante)
//
exports.show = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.contract) {
		response.send({status: {error: true, message: 'Informe a key do publicante.'}});
	} else {
		Contract.find({publisher_id: request.params.contract}, function (err, publishers) {
			if (err) {
				response.send({status: {error: true, message: 'O publicante não pode ser localizado.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {publishers: publishers}});
			}
		});
	}
};

//
// assinatura
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	if (! request.body.subscriber_id) {
		response.send({status: {error: true, message: 'Informe o ID do assinante.'}});
	} else if (! request.body.publisher_id) {
		response.send({status: {error: true, message: 'Informe o ID do publicante.'}});
	} else {
		var contract = new Contract({
			subscriber_id: request.body.subscriber_id,
			publisher_id: request.body.publisher_id
		});
		
		contract.save(function(err, room) {
			if (err) {
				response.send({status: {error: true, message: 'Não foi possível firmar o contrato. Erro no servidor.'}});
			} else {
				response.send({status: {error: false, message: null}, data: {key: room.id}});
			}
		});
	}
};

//
// desinscrição (get:subscriber_id,post:publisher_id)
//
exports.destroy = function(request, response) {
	response.contentType('application/json');
	
	if (! request.params.contract) {
		response.send({status: {error: true, message: 'Informe a key do assinante.'}});
	} else if (! request.body.publisher_id) {
		response.send({status: {error: true, message: 'Informe a key do publicante.'}});
	} else {
		Contract.remove({subscriber_id: request.params.contract, publisher_id: request.body.publisher_id}, function (err) {
			if (err) {
				response.send({status: {error: true, message: 'Não foi possivel desfazer o contrato. Contrato não localizado.'}});
			} else {
				response.send({status: {error: false, message: null}});
			}
		});
	}
};
