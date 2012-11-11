
var querystring = require('querystring');
var http = require('http');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./config').db(mongoose);
var config = require('./config').dispatcher();
var Subscriber = require('./models/subscriber.js').make(Schema, mongoose);
var Queue = require('./models/queue.js').make(Schema, mongoose);

/**
 * Envia os dados de um publicante para um assinante
 *
 * @param String domain [description]
 * @param Integer port Número da porta
 * @param String path [description]
 * @param String method HTTP Method (POST, GET, PUT...)
 * @param Object data Objeto JSON. Pode ser vazio.
 * @return void [description]
 */
function dispatcherRest(domain, port, path, method, data) {
	data = querystring.stringify(data);
	
	var options = {
		host: domain,
		port: port,
		path: path,
		method: method,
		agent: http.globalAgent,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		}
	};
	
	var request = http.request(options, function(response) {
		response.setEncoding('utf8');
		
		response.on('data', function (chunk) {
			console.log('Response: ' + chunk);
		});
	});
	
	if (data.length > 0)
		request.write(data);
	
	request.end();
	
	return true;
}

function dispatcher() {
	Queue.find({}, function (err, queues) {
		if (! err && queues.length > 0) {
			queues.forEach(function (queue) {
				var deleted = false;
				
				queue.subscribers.forEach(function (subscriber, index) {
					var result = dispatcherRest(
						subscriber.domain,
						subscriber.port,
						subscriber.path,
						subscriber.method,
						queue.data
					);
					
					if (result) {
						queue.subscribers.splice(index, 1);
						
						deleted = true;
						
						console.log('from publisher_id: '+ queue.publisher_id +' to subscriber_id: '+ subscriber._id);
					}
				});
				
				if (queue.subscribers.length > 0 && deleted) {
					var upsertData = queue.toObject();
					
					delete upsertData._id;
					
					Queue.update({_id: queue.id}, upsertData, {upsert: true}, function (error) {
						if (error) {
							console.log('Um erro ocorreu: '+ error);
						}
					});
				} else if (deleted) {
					Queue.findByIdAndRemove(queue.id, function (err) {
						if (err) {
							console.log('Um erro ocorreu para remover a queue. Possível recursão ocorrerá.');
						}
					});
				}
			});
		}
	});
	
	setTimeout(dispatcher, config.interval);
}

dispatcher();
