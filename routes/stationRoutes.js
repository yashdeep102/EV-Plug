const express = require('express');
const router = express.Router();
const errorWrap = require('../errorUtils/errorWrap');
const Station = require('../models/stationModel');
const { isLoggedIn, joiValidateStation, isOwner } = require('../middleware');
const stations = require('../controllers/stationControllers');
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


router.get('/', errorWrap(stations.index));

router.post('/', isLoggedIn, upload.array('image'), joiValidateStation, errorWrap(stations.createStation));




router.get('/new', isLoggedIn, stations.renderNewForm);

router.get('/:id/edit', isLoggedIn, isOwner, errorWrap(stations.renderEditForm));



router.get('/:id', errorWrap(stations.show))

router.put('/:id', isLoggedIn, isOwner, upload.array('image'), joiValidateStation, errorWrap(stations.updateStation))

router.delete('/:id', isLoggedIn, isOwner, errorWrap(stations.deleteStation))


module.exports = router;