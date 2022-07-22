const express = require('express');
const router = express.Router({ mergeParams: true });
const ErrorClass = require('../errorUtils/ErrorClass')
const errorWrap = require('../errorUtils/errorWrap');
const Review = require('../models/reviewModel');
const Station = require('../models/stationModel');
const { joiValidateReview, isLoggedIn, isReviewOwner } = require('../middleware');
const reviews = require('../controllers/reviewControllers')



router.post('/', isLoggedIn, joiValidateReview, errorWrap(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewOwner, errorWrap(reviews.deleteReview));

module.exports = router;