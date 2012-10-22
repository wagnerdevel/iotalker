

module.exports.make = function make(Schema, mongoose) {

	var sensorSchema = new Schema({
		description: String,
		status: String,
		active: Boolean
	});
	
	return mongoose.model('Sensor', sensorSchema);
	
};
