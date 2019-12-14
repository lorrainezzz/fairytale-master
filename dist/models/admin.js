let mongoose = require('mongoose');

let AdminSchema = new mongoose.Schema({
  name: String,
  pwd: String
}, {
  collection: 'admin'
});
module.exports = mongoose.model('Admin', AdminSchema);