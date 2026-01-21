const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-route', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
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

// Routes
app.post('/api/deliveries', async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/deliveries', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ status: 'pending' });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ available: true });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/optimize', async (req, res) => {
  try {
    const { deliveries, vehicles } = req.body;
    
    // Get AI traffic predictions
    const trafficData = await getTrafficPrediction(deliveries);
    
    // Simple route optimization with traffic consideration
    const routes = vehicles.map((vehicle, vehicleIndex) => {
      const assignedDeliveries = deliveries
        .map((_, index) => index)
        .filter((_, index) => index % vehicles.length === vehicleIndex);
      
      const baseDistance = assignedDeliveries.length * 5;
      const trafficAdjustedDistance = baseDistance * trafficData.overallMultiplier;
      
      return {
        vehicleId: vehicle.vehicleId,
        deliverySequence: assignedDeliveries,
        estimatedTime: trafficAdjustedDistance,
        trafficInfo: {
          multiplier: trafficData.overallMultiplier,
          source: trafficData.source,
          confidence: trafficData.confidence,
          recommendations: trafficData.recommendations
        }
      };
    });
    
    res.json({ 
      routes, 
      totalDistance: routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      trafficAnalysis: trafficData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reroute', async (req, res) => {
  try {
    const { incident, affectedRoutes } = req.body;
    
    // Re-optimize affected routes
    const deliveries = await Delivery.find({ _id: { $in: affectedRoutes } });
    const vehicles = await Vehicle.find({ available: true });
    
    const trafficData = await getTrafficPrediction(deliveries, incident);
    const optimizationResult = await axios.post('http://localhost:8080/optimize', {
      deliveries,
      vehicles,
      trafficData
    });
    
    // Emit real-time update
    io.emit('route-update', optimizationResult.data);
    
    res.json(optimizationResult.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Traffic Prediction Function
async function getTrafficPrediction(deliveries, incident = null) {
  try {
    const TrafficPredictor = require('../ai/traffic-predictor');
    const predictor = new TrafficPredictor();
    
    const trafficData = await predictor.predictTraffic(deliveries);
    
    // Check for incidents
    const incidents = await predictor.detectIncidents({
      minLat: 12.8, maxLat: 13.1,
      minLng: 77.4, maxLng: 77.8
    });
    
    if (incidents.length > 0 || incident) {
      trafficData.overallMultiplier *= 1.5;
      trafficData.recommendations.push('Traffic incident detected - expect delays');
    }
    
    return trafficData;
  } catch (error) {
    console.error('AI Traffic prediction error:', error);
    return getBasicTrafficData();
  }
}

function getBasicTrafficData() {
  const currentHour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  let multiplier = 1.0;
  let reason = 'Normal traffic';
  
  if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19)) {
    multiplier = 1.5;
    reason = 'Rush hour traffic';
  }
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier *= 0.8;
    reason = 'Weekend traffic';
  }
  
  return { 
    overallMultiplier: multiplier,
    source: 'Basic Analysis',
    confidence: 0.7,
    recommendations: [reason]
  };
}

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});