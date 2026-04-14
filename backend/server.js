const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Fix for MongoDB querySrv ECONNREFUSED in some networks
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const { getDistance } = require('./utils/geoUtils');
const { appendToExcel } = require('./utils/excelUtils');
const Attendance = require('./models/Attendance');
const Vendor = require('./models/Vendor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    seedVendors();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Initial Seed for Vendors (if empty)
const seedVendors = async () => {
  try {
    const count = await Vendor.countDocuments();
    if (count === 0) {
      const defaultVendors = [
        { name: 'SKT' },
        { name: 'Blue Wheel' },
        { name: 'Riya' },
        { name: 'Nagar' },
        { name: 'Pooja' },
        { name: 'ERN' }
      ];
      await Vendor.insertMany(defaultVendors);
      console.log('🌱 Vendors seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding vendors:', err);
  }
};

// Routes

// 1. Get all vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Submit Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { vendor, vehicleNumber, driverName, mobileNumber, entryPass, dcdStatus, vehicleType, location } = req.body;
    
    // Server-side distance validation
    const officeLat = parseFloat(process.env.OFFICE_LAT);
    const officeLng = parseFloat(process.env.OFFICE_LNG);
    const allowedRadius = parseFloat(process.env.ALLOWED_RADIUS);
    
    const distance = getDistance(location.lat, location.lng, officeLat, officeLng);
    
    if (distance > allowedRadius) {
      return res.status(403).json({ 
        message: `Submission failed. You are ${Math.round(distance)}m away, which is outside the ${allowedRadius}m allowed radius.`,
        distance: Math.round(distance)
      });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const attendanceEntry = new Attendance({
      vendor,
      vehicleNumber,
      driverName,
      mobileNumber,
      entryPass,
      dcdStatus,
      vehicleType,
      date: today,
      location,
      distanceFromOffice: Math.round(distance)
    });

    await attendanceEntry.save();
    
    // Also save to local Excel sheet as backup
    appendToExcel(attendanceEntry);

    res.status(201).json({ 
      message: 'Attendance recorded successfully!', 
      data: attendanceEntry,
      whatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER 
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. Get Dashboard Stats (with Aggregation)
app.get('/api/dashboard', async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const selectedDate = date || new Date().toISOString().split('T')[0];

    // 1. Total Entries (All time)
    const totalEntries = await Attendance.countDocuments();

    // 2. Today's Entries
    const todayEntriesCount = await Attendance.countDocuments({ date: selectedDate });

    // 3. Vendor Summary (Aggregation)
    const vendorSummary = await Attendance.aggregate([
      { $match: { date: selectedDate } },
      { $group: { _id: "$vendor", count: { $sum: 1 } } },
      { $project: { vendor: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 4. Pass / DCD Stats (Aggregation)
    const stats = await Attendance.aggregate([
      { $match: { date: selectedDate } },
      { $facet: {
          passStats: [
            { $group: { _id: "$entryPass", count: { $sum: 1 } } }
          ],
          dcdStats: [
            { $group: { _id: "$dcdStatus", count: { $sum: 1 } } }
          ]
      }}
    ]);

    // Format stats for frontend
    const passCount = stats[0].passStats.find(s => s._id === 'Yes')?.count || 0;
    const noPassCount = stats[0].passStats.find(s => s._id === 'No')?.count || 0;
    const dcdCount = stats[0].dcdStats.find(s => s._id === 'Yes')?.count || 0;
    const nonDcdCount = stats[0].dcdStats.find(s => s._id === 'No')?.count || 0;

    // 5. Last Entry Details
    const lastEntry = await Attendance.findOne().sort({ timestamp: -1 });

    // 6. Full Records for that date
    const records = await Attendance.find({ date: selectedDate }).sort({ timestamp: -1 });

    res.json({
      totalEntries,
      todayEntriesCount,
      vendorSummary,
      passCount,
      noPassCount,
      dcdCount,
      nonDcdCount,
      lastEntry,
      records,
      whatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

