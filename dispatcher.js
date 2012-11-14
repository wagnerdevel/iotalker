
var querystring = require('querystring');
var http = require('http');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./config').db(mongoose);
var config = require('./config').dispatcher();
var Subscriber = require('./models/subscriber.js').make(Schema, mongoose);
var Queue = require('./models/queue.js').make(Schema, mongoose);

function SimpleQueue() {
	var queue = [];
	
	this.enqueue = function(object) {
		queue.push(object);
	},
	
	this.dequeue = function() {
		queue.shift();
	},
	
	this.length = function() {
		return queue.length;
	},
	
	this.getQueue = function() {
		return queue;
	};
}

function dispatcherRest(queue, subscriber, index) {
	var data = querystring.stringify(queue.data);
	
	var options = {
		host: subscriber.domain,
		port: subscriber.port,
		path: subscriber.path,
		method: subscriber.method,
		agent: http.globalAgent,
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			'content-length': data.length
		}
	};
	
	var request = http.request(options, function(response) {
		response.setEncoding('utf8');
		
		response.on('data', function () {
			console.log('from publisher_id: '+ queue.publisher_id +' to subscriber_id: '+ subscriber._id);
		});
	});
	
	request.on('error', function (e) {
		console.log('erro ao enviar dados');
		console.log(e);
	});
	
	if (data.length > 0)
		request.write(data);
	
	request.end();
}

function saveEventError(event) {
	
}

function dispatcher() {
	Queue.find({}, null, {sort: {datetime: 1}}, function (err, queues) {
		if (! err && queues.length > 0) {
			queues.forEach(function (queue) {
				Queue.findByIdAndRemove(queue._id, function (err) {
					if (err) {
						console.log('Erro ao remover evento do BD. Recursão prevista. Detalhes:');
						
						console.log(err);
					}
				});
				
				queue.subscribers.forEach(function (subscriber, index) {
					dispatcherRest(queue, subscriber, index);
				});
			});
		}
	});
	
	setTimeout(dispatcher, config.interval);
}

dispatcher();
