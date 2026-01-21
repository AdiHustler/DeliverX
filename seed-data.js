const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ai-route', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const deliverySchema = new mongoose.Schema({
  address: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  timeWindow: { start: Date, end: Date },
  priority: Number,
  status: { type: String, enum: ['pending', 'delivered'], default: 'pending' }
});

const vehicleSchema = new mongoose.Schema({
  vehicleId: String,
  capacity: Number,
  currentLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  available: { type: Boolean, default: true }
});

deliverySchema.index({ location: '2dsphere' });
const Delivery = mongoose.model('Delivery', deliverySchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function seedData() {
  try {
    // Clear existing data
    await Delivery.deleteMany({});
    await Vehicle.deleteMany({});
    
    // Load sample data
    const deliveriesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'sample-deliveries.json'), 'utf8')
    );
    
    const vehiclesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'sample-vehicles.json'), 'utf8')
    );
    
    // Insert data
    await Delivery.insertMany(deliveriesData);
    await Vehicle.insertMany(vehiclesData);
    
    console.log('✅ Sample data seeded successfully!');
    console.log(`📦 ${deliveriesData.length} deliveries added`);
    console.log(`🚛 ${vehiclesData.length} vehicles added`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();