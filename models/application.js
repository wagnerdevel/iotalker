
module.exports.make = function make(Schema, mongoose) {

	var applicationSchema = new Schema({
		description: String,
		domain: String,
		port: Number,
		path: String,
		method: String,
		data: Object,
		active: Boolean
	});
	
	return mongoose.model('Application', applicationSchema);
	
};
