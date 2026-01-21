# Quick Setup Guide

## MongoDB Installation Required

Since MongoDB is not installed, you have two options:

### Option 1: Install MongoDB Locally
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install and start the service
3. Run: `npm run seed-data`

### Option 2: Use MongoDB Atlas (Cloud)
1. Create free account at: https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update `server/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-route
   ```

## Starting the Application

### 1. Start Java OR-Tools Service
```bash
cd optimizer-java
mvn spring-boot:run
```

### 2. Start Node.js Backend
```bash
cd server
npm run dev
```

### 3. Start React Frontend
```bash
cd client
npm start
```

## Testing Without Database

The application will work with in-memory data for testing:
- Add deliveries using the form
- Add vehicles using the panel
- Click "Optimize Routes" to see the route planning in action

## Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Java Service: http://localhost:8080

## Demo Flow
1. Open http://localhost:3000
2. Click sample locations to add deliveries
3. Add a vehicle with default settings
4. Click "Optimize Routes"
5. View the optimized routes on the map