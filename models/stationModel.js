const mongoose = require('mongoose');
const Review = require('./reviewModel');

//virtual property set up
const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }

const StationSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    phone: Number,
    details: String,
    location: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

StationSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/stations/${this._id}"><strong>${this.title}</strong></a>`;
})

// Mongoose middleware for deleting reviews associated with a station, whenever that station is deleted.
StationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    };
});

const Station = mongoose.model('Station', StationSchema);
module.exports = Station;