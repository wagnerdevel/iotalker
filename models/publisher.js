
module.exports.make = function make(Schema, mongoose) {

	var publisherSchema = new Schema({
		description: String,
		status: String,
		active: Boolean
	});
	
	return mongoose.model('Publisher', publisherSchema);
	
};
