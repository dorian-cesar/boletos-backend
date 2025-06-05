const mongoose = require('mongoose');

const ServiceTemplateSchema = new mongoose.Schema({
    origin: String,
    destination: String,
    time: String,
    days: [Number], // 1 - 7
    busLayout: String,
    price: {
        type: Number,
        required: true
    },
    company: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ServiceTemplate', ServiceTemplateSchema);