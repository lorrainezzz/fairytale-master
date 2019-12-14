let mongoose = require('mongoose');

let AuthorSchema = new mongoose.Schema({
		name: String,
		region: String,
		numberofFT: {type: Number, default: 0}
	},
	{ collection: 'author' });

module.exports = mongoose.model('Author', AuthorSchema);