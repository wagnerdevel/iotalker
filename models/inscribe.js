
module.exports.make = function make(Schema, mongoose) {

	var inscribeSchema = new Schema({
		sensor_id: Schema.ObjectId,
		app_id: Schema.ObjectId
	});
	
	return mongoose.model('Inscribe', inscribeSchema);
	
};
