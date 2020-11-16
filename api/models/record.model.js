const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    bluetoothScore: { type: Number, default: 0 },
    dailyScores: [{
        date: String,
        score: Number,
        bluetoothScore: Number,
    }],
    userId: String,
    innerCircle: { type: Array, "default": [] },
    infected: Boolean,
}, {
    timestamps: true
});

module.exports = mongoose.model('RecordSchema', recordSchema);