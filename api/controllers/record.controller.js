const Record = require('../models/record.model');
const Location = require('../models/location.model');
const User = require('../models/user.model');
const calculateDistance = require('../helpers/calculateDistance.helper');
const moment = require('moment');
const QRCode = require('qrcode');

const generateQR = async text => {
    try {
        console.log(await QRCode.toDataURL(text))
    } catch (err) {
        console.error(err)
    }
}

exports.activateProfile = async (req, res) => {
    let id = req.params.id;

    try {

        let record = new Record({ userId: id });
        await record.save();

        let qr = generateQR(id);

        return res.json({
            success: 0,
            message: "Profile Activated!",
            qr: qr
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
        let record = await Record.findOne({ userId: self });

        if (record.innerCircle.includes(scanned)) {
            return res.json({
                success: 1,
                message: "Already in inner circle!"
            });
        }

        await Record.findOneAndUpdate({ userId: self }, { $push: { innerCircle: scanned } });
        await Record.findOneAndUpdate({ userId: scanned }, { $push: { innerCircle: self } });

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
        });      // main logic

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
        let obj = await Record.findOne({ userId: id });

        let scoreObj = obj.dailyScores.filter(el => moment(el.date).isSame(req.params.date, "day"))[0];

        return res.json({
            success: 1,
            score: scoreObj.score,
            bluetoothScore: scoreObj.bluetoothScore,
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
                    return res.json({
                        success: 1,
                        message: "Location updated along with score!",
                    });
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

exports.updateBluetoothScore = async (req, res) => {
    try {
        await Record.findOneAndUpdate({ userId: req.body.userId }, { $inc: { bluetoothScore: 1 } });
        await Record.findOneAndUpdate({ userId: req.body.scannedId }, { $inc: { bluetoothScore: 1 } });
        return res.json({
            success: 1,
            message: "In contact with infected person!",
        });
    } catch (error) {
        return res.json({
            success: -1,
            message: "something happened"
        }); const generateQR = async text => {
            try {
                console.log(await QRCode.toDataURL(text))
            } catch (err) {
                console.error(err)
            }
        }
    }
}

exports.updateInfected = async (req, res) => {
    try {
        await Record.findOneAndUpdate({ userId: req.body.userId }, { infected: req.body.infected });
        return res.jgetAllInnerCircleEmailsson({
            success: 1,
            message: "Infected status updated! Stay Safe!",
        });
    } catch (error) {
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.transferAll = async (req, res) => {
    try {
        let records = await Record.find({});
        records.forEach(async el => {
            await Record.findOneAndUpdate({ userId: el.userId }, {
                score: 0,
                bluetoothScore: 0,
                $push: {
                    dailyScores: {
                        score: el.score,
                        bluetoothScore: el.bluetoothScore,
                        date: moment().format('YYYY-MM-DD'),
                    }
                }
            });
        });
        res.json({
            success: 1
        });
    } catch (error) {
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.travelData = async (req, res) => {
    try {
        let nowArr = moment().format('HH:mm:ss').split(':');
        let now = (nowArr[0] * 3600) + (nowArr[1] * 60) + nowArr[2];

        let records = await Record.find({
            userId: req.params.self_id,
            "createdAt": { $gte: new Date(Date.now() - now * 60 * 1000) }
        });

        return res.json({
            success: 1,
            records: records,
        });
    } catch (error) {
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.getAllInnerCircleEmails = async (req, res) => {
    try {
        const id = req.params.self_id;
        let record = await Record.findOne({ userId: id });
        console.log(record);

        let listOfEmails = [];

        let innerCircle = record.innerCircle;
        
        for (let i = 0; i < innerCircle.length; i++) {
            let el = await User.findOne({ _id: innerCircle[i] });
            listOfEmails.push(el.email);
        }

        return res.json({
            success: 1,
            listOfEmails
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}

exports.getProfileCurrentScores = async (req, res) => {
    try {
        const id = req.params.self_id;
        let record = await Record.findOne({ userId: id });

        return res.json({
            success: 1,
            score: record.score,
            bluetoothScore: record.bluetoothScore,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: -1,
            message: "something happened"
        });
    }
}
