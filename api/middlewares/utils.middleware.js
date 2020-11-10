const calculateDistance = require('../helpers/calculateDistance.helper');

exports.calcDistance = (req, res, next) => {
    let distanceInMeters = calculateDistance(req.params.s_lat, req.params.s_lng, req.params.r_lat, req.params.r_lng);
    return res.json({
        distanceInMeters: distanceInMeters,
        success: 0,
    });
}