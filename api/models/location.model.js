const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    lastSeenAt: {
        lat: Number,
        lng: Number
    },
    userId: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('LocationSchema', locationSchema);