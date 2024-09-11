const mongoose = require('mongoose');

const solarSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  eastCampus: { type: Number, required: true },
  mbaMca: { type: Number, required: true },
  civil: { type: Number, required: true },
  mech: { type: Number, required: true },
  auto: { type: Number, required: true },
  total: { type: Number, required: true }
});

const Solar = mongoose.model('Solar', solarSchema);

module.exports = Solar;
