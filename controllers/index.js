
/*
 * GET home page.
 */

exports.index = function(request, response) {
	
	response.render('index', {title: 'urimed-middleware', location: location});
	
};
