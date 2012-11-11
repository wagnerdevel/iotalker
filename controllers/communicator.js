
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var db = require('../config').db(mongoose);
var Subscriber = require('../models/subscriber.js').make(Schema, mongoose);
var Queue = require('../models/queue.js').make(Schema, mongoose);
var Contract = require('../models/contract.js').make(Schema, mongoose);

//
// add
//
exports.create = function(request, response) {
	response.contentType('application/json');
	
	Contract.find({publisher_id: request.body.id}, function (err, contractSubscribers) {
		if (! err && contractSubscribers.length > 0) {
			var queue = new Queue({
				publisher_id: request.body.id,
				datetime: new Date(),
				data: request.body.data,
				ip: request.body.ip,
				subscribers: []
			});
			
			var subscribersId = [];
			
			contractSubscribers.forEach(function (contract) {
				subscribersId.push({_id: contract.subscriber_id});
			});
			
			Subscriber.find({$or:subscribersId}, function (errOnFind, subscribers) {
				if (! errOnFind) {
					queue.subscribers = subscribers;
					
					queue.save(function(errOnSave) {
						if (errOnSave) {
							response.send({status: {error: true, message: 'Não foi possível publicar a mensagem. Erro no servidor (1).'}});
						} else {
							response.send({status: {error: false, message: null}, data: {subscribers: subscribersId}});
						}
					});
				} else {
					response.send({status: {error: true, message: 'Não foi possível publicar a mensagem. Erro no servidor (2).'}});
				}
			});
		} else {
			response.send({status: {error: false, message: 'Nenhum assinante para esta publicação'}, data: {subscribers: []}});
		}
	});
};
