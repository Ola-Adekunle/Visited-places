const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, minlength: 6 },
    image: { type: String, require: true },
    places: [{ type: mongoose.Types.ObjectId, require: true, ref: 'Place' }] // [] is to tell mongodb that we have multiple places instead of one. mongoose.Types.ObjectId is used to make the places a real Id. The ref property allows us to establish a connection between current placeSchema and the userSchema.
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);