
module.exports.make = function make(Schema, mongoose, Application) {
	
	var queueSchema = new Schema({
		sensor_id: String,
		datetime: Date,
		data: Object,
		ip: String,
		applications: []
	});
	
	return mongoose.model('Queue', queueSchema);
	
};
