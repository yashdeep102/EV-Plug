const Station = require('../models/stationModel');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const stations = await Station.find({});
    res.render('./stations/index', { stations })
};

module.exports.createStation = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.station.location,
        limit: 1
    }).send();
    const newStation = new Station(req.body.station);
    newStation.geometry = geoData.body.features[0].geometry;
    newStation.images = req.files.map(f => { return { url: f.path, filename: f.filename } });
    newStation.owner = req.user._id;
    await newStation.save();
    req.flash('success', 'Successfully added a new station!');
    res.redirect(`/stations/${newStation._id}`);
};

module.exports.renderNewForm = (req, res) => {
    res.render('./stations/new');
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const station = await Station.findById(id);
    if (!station) {
        req.flash('error', 'Cannot find that Charging Station');
        return res.redirect('/stations');
    }
    res.render('./stations/edit', { station });
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const station = await Station.findById(id).populate({ path: 'reviews', populate: { path: 'owner' } });
    if (!station) {
        req.flash('error', 'Cannot find that Charging Station');
        return res.redirect('/stations');
    }
    res.render('./stations/show', { station });
};

module.exports.updateStation = async (req, res) => {
    const { id } = req.params;

    // const updatedStation = req.body.station;
    // await Station.findByIdAndUpdate(id, updatedStation);
    const station = await Station.findByIdAndUpdate(id, { ...req.body.station });
    const imgs = req.files.map(f => { return { url: f.path, filename: f.filename } });
    station.images.push(...imgs);
    await station.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await station.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated station!');
    res.redirect(`/stations/${station._id}`);
};

module.exports.deleteStation = async (req, res) => {
    const { id } = req.params;
    await Station.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Charging Station!');
    res.redirect('/stations');
};