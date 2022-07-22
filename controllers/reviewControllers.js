const Station = require('../models/stationModel');
const Review = require('../models/reviewModel');

module.exports.createReview = async (req, res) => {
    const review = new Review(req.body.review);
    const station = await Station.findById(req.params.id);
    review.owner = req.user._id;
    station.reviews.push(review);
    await review.save();
    await station.save();
    req.flash('success', 'Review added!');
    res.redirect(`/stations/${station._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Station.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/stations/${id}`)
};