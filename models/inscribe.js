
module.exports.make = function make(Schema, mongoose) {

	var inscribeSchema = new Schema({
		sensor_id: String,
		app_id: String
	});
	
	return mongoose.model('Inscribe', inscribeSchema);
	
};
