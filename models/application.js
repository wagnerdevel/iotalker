
module.exports.make = function make(Schema, mongoose) {

	var applicationSchema = new Schema({
		description: String,
		address: String,
		active: Boolean
	});
	
	return mongoose.model('Application', applicationSchema);
	
};
