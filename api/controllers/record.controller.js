const Record = require('../models/record.model');
const Location = require('../models/location.model');
const User = require('../models/user.model');
const calculateDistance = require('../helpers/calculateDistance.helper');
const momentHelper = require('../helpers/calculateMinutes.helper');

exports.activateProfile = async (req, res) => {
    let id = req.params.id;

    try {

        let record = new Record({ userId: id });
        await record.save();

        return res.json({
            success: 0,
            message: "Profile Activated!"
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.verifyQRcode = async (req, res) => {
    let self = req.params.self_id;
    let scanned = req.params.ref_id;

    try {
        await Record.findOneAndUpdate({ _id: self }, { $push: { innerCircle: scanned } });
        await Record.findOneAndUpdate({ _id: scanned }, { $push: { innerCircle: self } });

        let scannedRecord = await User.findOne({ _id: scanned });
        let name = scannedRecord.username;

        return res.json({
            success: 0,
            message: `${name}, added to "Inner-Circle"!`
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.removeFromIC = async (req, res) => {
    let self = req.params.self_id;
    let scanned = req.params.ref_id;

    try {
        await Record.findOneAndUpdate({ _id: self }, { $pull: { innerCircle: scanned } });
        await Record.findOneAndUpdate({ _id: scanned }, { $pull: { innerCircle: self } });

        let scannedRecord = await User.findOne({ _id: scanned });
        let name = scannedRecord.username;

        return res.json({
            success: 0,
            message: `${name}, removed from "Inner-Circle"!`
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.getMonthScores = async (req, res) => {
    let id = req.params.self_id;

    try {
        let obj = await Record.findOne({ _id: id });
        return res.json({
            success: 0,
            dailyScores: obj.dailyScores,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.updateLocation = async (req, res) => {
    try {
        let userId = req.body.userId;
        let lastSeenAt = {
            lat: req.body.lat,
            lng: req.body.lng,
        };
        let packet = { userId, lastSeenAt };

        let allLocations = await Location.find({ "createdAt": { $gte: new Date(Date.now() - 1 * 60 * 1000) } });
        console.log(allLocations);
        let profile = await Record.findOne({ userId: userId });

        await allLocations.forEach(async location => {
            // console.log(calculateDistance(lastSeenAt.lat, lastSeenAt.lng, location.lastSeenAt.lat, location.lastSeenAt.lng));
            if (calculateDistance(lastSeenAt.lat, lastSeenAt.lng, location.lastSeenAt.lat, location.lastSeenAt.lng))
                if (!(profile.innerCircle.includes(location.userId) || location.userId == userId)) {
                    console.log("here");
                    await Record.findOneAndUpdate({ userId }, { $inc: { score: 1 } });
                    await Record.findOneAndUpdate({ userId: location.userId }, { $inc: { score: 1 } });
                }
        });

        let location = new Location(packet);
        await location.save();

        return res.json({
            success: 0,
            message: "Location updated!",
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}
