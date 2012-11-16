
/*
 * GET home page.
 */

exports.index = function(request, response) {
	
	response.redirect('/manager/publisher');
	
};

exports.show = function(request, response) {
	
	var location = 'publisher';
	
	if (request.params.manager.toUpperCase() == 'SUBSCRIBER')
		location = 'subscriber';
	else if (request.params.manager.toUpperCase() == 'CONTRACT')
		location = 'contract';
	
	response.render('manager/' + location, {location: location});
	
};
