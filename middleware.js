const { joiStationSchema, joiReviewSchema } = require('./joiSchemas.js');
const ErrorClass = require('./errorUtils/ErrorClass');
const Station = require('./models/stationModel');
const Review = require('./models/reviewModel');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};


module.exports.joiValidateStation = (req, res, next) => {
    const { error } = joiStationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ErrorClass(msg, 400);
    } else {
        next();
    }
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const station = await Station.findById(id);
    if (!station.owner.equals(req.user._id)) {
        req.flash('error', 'Access Denied!');
        return res.redirect(`/stations/${id}`);
    }
    next();
}

module.exports.joiValidateReview = (req, res, next) => {
    const { error } = joiReviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(element => element.message).join(',');
        throw new ErrorClass(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.owner.equals(req.user._id)) {
        req.flash('error', 'Access Denied!');
        return res.redirect(`/stations/${id}`);
    }
    next();
}