const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const placeSchema = new Schema ({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    creator: { type: mongoose.Types.ObjectId, require: true, ref: 'User' } // mongoose.Types.ObjectId is used to make the creator a real Id. the ref property allows us to establish a connection between current placeSchema and the userSchema.
});

module.exports = mongoose.model('Place', placeSchema);