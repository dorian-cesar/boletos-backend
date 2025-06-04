const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    number: String,
    status: String,
    holdUntil: Date,
    reserved: Boolean,
    paid: Boolean,
    authCode: String
});

const GeneratedServiceSchema = new mongoose.Schema({
    date: String,
    origin: String,
    destination: String,
    departureTime: String,
    layout: String,
    price: {
        type: Number,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    seats: [SeatSchema]
});

module.exports = mongoose.model('GeneratedService', GeneratedServiceSchema);