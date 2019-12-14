let mongoose = require('mongoose');

let FairytaleSchema = new mongoose.Schema({
        name: String,
        author: String,
        category: String,
        like: {type: Number, default: 0}
    },
    { collection: 'fairytale' });

module.exports = mongoose.model('Fairytale', FairytaleSchema);