const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  vendor: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  entryPass: { type: String, required: true }, // "Yes" or "No"
  dcdStatus: { type: String, required: true }, // "Yes" or "No"
  vehicleType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  date: { type: String, required: true }, // YYYY-MM-DD
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  distanceFromOffice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
