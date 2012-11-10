
module.exports.make = function make(Schema, mongoose) {

	var contractSchema = new Schema({
		publisher_id: String,
		subscriber_id: String
	});
	
	return mongoose.model('Contract', contractSchema);
	
};
