let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  name: String,
  pwd: String
}, {
  collection: 'user'
});
module.exports = mongoose.model('User', UserSchema);