
module.exports.make = function make(Schema, mongoose) {
	
	var queueSchema = new Schema({
		publisher_id: String,
		datetime: Date,
		data: Object,
		ip: String,
		error: Boolean,
		subscribers: []
	});
	
	return mongoose.model('Queue', queueSchema);
	
};
