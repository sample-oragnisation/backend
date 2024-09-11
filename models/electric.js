const mongoose = require('mongoose');

const electricSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    eastCampus: { type: Number, required: true },
    mbaMca: { type: Number, required: true },
    civil: { type: Number, required: true },
    mech: { type: Number, required: true },
    auto: { type: Number, required: true },
    total: { type: Number, required: true }
  });
  

const Electric = mongoose.model('Electric', electricSchema);

module.exports = Electric;
