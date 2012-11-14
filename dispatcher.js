
var querystring = require('querystring');
var http = require('http');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./config').db(mongoose);
var config = require('./config').dispatcher();
var Subscriber = require('./models/subscriber.js').make(Schema, mongoose);
var Queue = require('./models/queue.js').make(Schema, mongoose);

/**********************************************************************************************************
 
 Resumo do procedimento para envio de eventos:
 
 **********************************************************************************************************
 
 1 Dispatcher busca na collection Queues todos os eventos a serem publicados.
   Que podem ser no máximo 20 (valor padrão que pode ser alterado nas configurações do middleware).
   Esse valor de limite existe para permitir que os dispatchers sejam distribuídos.
   
 2 Percorre cada evento, removendo-os da collection Queues e disparando-os para todos os subscribers
   assinantes do publisher gerador do evento.
   
 3 Se o subscriber receber o evento com sucesso, será retirado da lista de subscribers do evento. (Isso
   é necessário, pois pode acontecer da referência do evento estar na fila de subscribers com erros.)
   
 4 Caso não seja possível enviar o evento para o subscriber, o evento é mantido numa fila de subscribers
   com erros, para ser tratados posteriormente.
 
   4.1 Após enviar todos os eventos da fila atual o dispatcher tenta enviar novamente os eventos para os
       subscribers problemáticos.
       
   4.2 Caso o evento seja enviado com sucesso para o subscriber, esse último é retirado da fila de
       subscribers do evento. Caso não existam mais subscribers na fila do evento, então o evento é
       removido da lista dos eventos com erros.
       
   4.3 Se o subscriber ainda se encontrar off, então serão aguardado 120s para a terceira tentativa
       de envio.
       
   4.4 Se o subscriber receber o evento então executa-se o procedimento similar ao 4.2.
   
   4.5 Em caso de falha o evento é armazenado em uma collection para consulta do subscriber assim
       que o mesmo perceber que voltou a ficar operante.
   
 5 O dispatcher é invocado novamente após o tempo de intervalo definido nas configurações do middleware.
 
 **********************************************************************************************************
 */

/**
 * Geram um número aleatório entre min e max
 *
 * @param  int min
 * @param  int max
 * @return int
 */
function numberGenerator(min, max) {
	var random = Math.random() * (max - min);
	
	return parseInt(min) + Math.floor(random);
}

/**
 * Envia o evento para um subscriber via REST
 *
 * @param Queue queue
 * @param Subscriber subscriber
 * @param int index
 * @return void
 */
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
		
		response.on('end', function () {
			queue.subscribers.splice(index, 1);
			
			console.log('from publisher_id: '+ queue.publisher_id +' to subscriber_id: '+ subscriber._id);
		});
	});
	
	request.on('error', function (e) {
		console.log('Erro ao entregar para o subscriber #'+ subscriber._id);
		console.log(e);
		
		if (! queue.sendingAttemps)
			queue.sendingAttemps = 0;
		
		queue.sendingAttemps++;
		
		if (queue.sendingAttemps <= 2) {
			var timeout = numberGenerator(config.timeNextAttempt.min, config.timeNextAttempt.max);
			
			setTimeout(function () { dispatcherRest(queue, subscriber, index); }, timeout * queue.sendingAttemps);
		} else {
			var upsertData = queue.toObject();
			
			upsertData.error = true;
			
			delete upsertData._id;

			Queue.update({_id: queue.id}, upsertData, {upsert: true}, function (error) {
				if (error) {
					console.log('Um erro ocorreu ao atualizar a queue: '+ queue._id);
					console.log(error);
				}
			});
		}
	});
	
	if (data.length > 0)
		request.write(data);
	
	request.end();
}

/**
 * Busca em um intervalo de tempo pré determinado, os eventos do banco que deverão ser
 * enviados para seus subscribers.
 *
 * @return void
 */
function dispatcher() {
	Queue.find({error: false}, null, {sort: {datetime: 1}, limit: config.queuesAmount}, function (err, queues) {
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
