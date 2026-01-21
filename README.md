# AI-Based Dynamic Delivery Route Planner

A comprehensive system that optimizes delivery routes using AI-powered traffic prediction and real-time re-routing capabilities.

## 🚀 Features

- **Interactive Map Visualization**: Plot delivery points and vehicle routes using Mapbox GL
- **AI Traffic Prediction**: Predict traffic conditions using OpenAI/GPT models
- **Route Optimization**: Solve Vehicle Routing Problem (VRP) using Google OR-Tools
- **Real-time Updates**: Dynamic re-routing via WebSocket connections
- **Geospatial Database**: MongoDB with 2dsphere indexing for fast location queries

## 🏗️ Architecture

```
Frontend (React + Mapbox) ↔ Backend (Node.js) ↔ Java OR-Tools ↔ AI Prediction
                                    ↕
                            MongoDB Database
```

## 📋 Prerequisites

- Node.js (v16+)
- Java 11+
- Maven 3.6+
- MongoDB 4.4+
- Mapbox API Token
- OpenAI API Key (optional)

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd AI-Route
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/ai-route
PORT=3001
OPENAI_API_KEY=your_openai_key_here
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Update Mapbox token in `src/components/MapView.js`:
```javascript
mapboxgl.accessToken = 'your_mapbox_token_here';
```

### 4. Java OR-Tools Setup
```bash
cd ../optimizer-java
mvn clean install
```

### 5. Database Setup
Start MongoDB and create indexes:
```javascript
use ai-route
db.deliveries.createIndex({ location: "2dsphere" })
db.vehicles.createIndex({ currentLocation: "2dsphere" })
```

## 🚀 Running the Application

### Start all services:

1. **MongoDB**: `mongod`
2. **Java OR-Tools**: 
   ```bash
   cd optimizer-java
   mvn spring-boot:run
   ```
3. **Node.js Backend**:
   ```bash
   cd server
   npm run dev
   ```
4. **React Frontend**:
   ```bash
   cd client
   npm start
   ```

Access the application at `http://localhost:3000`

## 📊 Usage

### Adding Deliveries
1. Use the sidebar form to add delivery points
2. Click on sample locations for quick testing
3. Set priority levels (High/Medium/Low)

### Adding Vehicles
1. Click "Add Vehicle" in the vehicle panel
2. Set vehicle ID, capacity, and starting location
3. Vehicles appear as blue markers on the map

### Route Optimization
1. Add at least one delivery and one vehicle
2. Click "Optimize Routes" button
3. View optimized routes as colored lines on the map
4. Check route details in the vehicle panel

### Real-time Updates
- System automatically detects traffic incidents
- Routes are re-optimized when conditions change
- Updates pushed via WebSocket connections

## 🧪 Testing with Sample Data

Load sample data using the provided JSON files:

```bash
# Import sample deliveries
mongoimport --db ai-route --collection deliveries --file data/sample-deliveries.json --jsonArray

# Import sample vehicles
mongoimport --db ai-route --collection vehicles --file data/sample-vehicles.json --jsonArray
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliveries` | List all pending deliveries |
| POST | `/api/deliveries` | Add new delivery |
| GET | `/api/vehicles` | List available vehicles |
| POST | `/api/vehicles` | Add new vehicle |
| POST | `/api/optimize` | Optimize routes |
| POST | `/api/reroute` | Trigger re-routing |

## 🔧 Configuration

### Traffic Prediction
- Modify `ai/traffic-predictor.js` for custom AI models
- Adjust traffic multipliers based on local conditions
- Add real traffic data sources

### Route Optimization
- Configure vehicle constraints in Java OR-Tools
- Adjust optimization parameters in `VRPSolver.java`
- Add custom distance calculation methods

## 🚀 Deployment

### Backend (AWS/Render)
```bash
cd server
npm run build
# Deploy to your preferred platform
```

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy build folder
```

### Database (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Update connection string in `.env`
- Set up network access rules

## 🔮 Future Enhancements

- [ ] Reinforcement learning for adaptive routing
- [ ] Driver mobile application
- [ ] Multi-depot optimization
- [ ] Fuel consumption optimization
- [ ] Weather-based routing
- [ ] Customer notification system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Mapbox not loading**: Check API token and network connectivity
2. **OR-Tools errors**: Ensure Java 11+ and Maven are properly installed
3. **MongoDB connection**: Verify MongoDB is running and connection string is correct
4. **CORS errors**: Check backend CORS configuration

### Performance Tips

- Use MongoDB indexes for geospatial queries
- Implement caching for frequently accessed routes
- Optimize distance matrix calculations
- Use WebSocket connection pooling

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using React, Node.js, Java OR-Tools, and MongoDB**