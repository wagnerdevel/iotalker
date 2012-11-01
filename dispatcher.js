
var querystring = require('querystring');
var http = require('http');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./config').db(mongoose);
var config = require('./config').dispatcher();
var Application = require('./models/application.js').make(Schema, mongoose);
var Queue = require('./models/queue.js').make(Schema, mongoose, Application);

/**
 * Envia os dados de um sensor para uma aplicacao assinante
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
				queue.applications.forEach(function (app, index) {
					// var result = dispatcherRest(app.domain, app.port, app.path, app.method, queue.data);
					
					// if (result)
						// queue.applications.splice(index, 1);
				});
				
				if (queue.applications.length > 0) {
					queue.data.temperatura = 333;
					
					queue.update({$set: queue}, {});
					
					// Queue.findByIdAndUpdate(queue._id, {$set: queue}, function (error) {
					// 	if (error) {
					// 		console.log('Um erro ocorreu: '+ error);
					// 	}
					// });
				}
				
				console.log(queue);
				console.log();
			});
		}
	});
	
	//setTimeout(dispatcher, config.interval);
}

dispatcher();
