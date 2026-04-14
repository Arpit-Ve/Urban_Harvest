const mongoose = require('mongoose');
require('dotenv').config();
const Vendor = require('./models/Vendor');

const vendors = [
  { name: 'Global Logistics' },
  { name: 'Express Way Inc.' },
  { name: 'Swift Delivery Co.' },
  { name: 'Urban Haulers' },
  { name: 'Metro Movers' }
];

const uri = process.env.MONGODB_URI;

if (!uri || uri.includes('<username>')) {
  console.error('❌ Error: Please update your MONGODB_URI in the .env file before running the seed script.');
  process.exit(1);
}

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await Vendor.deleteMany({});
    await Vendor.insertMany(vendors);
    console.log('✅ Seed successful: Vendors added.');
    process.exit();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
