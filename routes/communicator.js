
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
