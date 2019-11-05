let mongoose = require('mongoose');

let AuthorSchema = new mongoose.Schema({
		name: String

	},
	{ collection: 'author' });

module.exports = mongoose.model('Author', AuthorSchema);