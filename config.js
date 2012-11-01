
var db = null;

exports.dispatcher = function() {
	return {
		interval: 5000
	};
};

exports.app = function(app, express, mongoose) {
	var config = this;
	
	app.configure(function() {
		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
	});
	
	app.configure('development', function(){
		app.use(express.errorHandler());
	});
	
	return config;
};

exports.db = function(mongoose) {
	if (! db)
		db = mongoose.connect('mongodb://localhost/urimed_middleware');
	
	return db;
};
