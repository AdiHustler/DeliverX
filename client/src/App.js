import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DeliveryForm from './components/DeliveryForm';
import VehiclePanel from './components/VehiclePanel';
import TrafficInsights from './components/TrafficInsights';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const API_BASE = 'http://localhost:3001/api';
const socket = io('http://localhost:3001');

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeDetails, setRouteDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [trafficData, setTrafficData] = useState(null);

  useEffect(() => {
    // Reset all data on website start
    setDeliveries([]);
    setVehicles([]);
    setRoutes([]);
    setRouteDetails([]);
    setTrafficData(null);
    
    // Add a default vehicle for testing
    const defaultVehicle = {
      vehicleId: 'VH001',
      capacity: 15,
      available: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716]
      }
    };
    setVehicles([defaultVehicle]);
    
    socket.on('route-update', (updatedRoutes) => {
      setRoutes(updatedRoutes.routes);
    });
    
    return () => socket.disconnect();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API_BASE}/deliveries`);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const addDelivery = (deliveryData) => {
    setDeliveries(prev => [...prev, deliveryData]);
    setRoutes([]);
    setRouteDetails([]);
  };

  const deleteDelivery = (index) => {
    const updatedDeliveries = deliveries.filter((_, i) => i !== index);
    setDeliveries(updatedDeliveries);
    setRoutes([]);
    setRouteDetails([]);
  };

  const addVehicle = (vehicleData) => {
    setVehicles(prev => [...prev, vehicleData]);
    setRoutes([]);
    setRouteDetails([]);
  };

  const handleRouteCalculated = (calculatedRoutes) => {
    setRouteDetails(calculatedRoutes);
    setActiveTab('routes'); // Auto-switch to routes tab without popup
  };

  const optimizeRoutes = () => {
    if (deliveries.length === 0 || vehicles.length === 0) {
      alert('Please add at least one delivery and one vehicle before optimizing routes.');
      return;
    }
    
    setIsOptimizing(true);
    
    // Simple client-side route optimization
    setTimeout(() => {
      const optimizedRoutes = [];
      
      vehicles.forEach((vehicle, vehicleIndex) => {
        const route = {
          vehicleId: vehicle.vehicleId,
          estimatedTime: deliveries.length * 8, // Mock estimated time
          deliverySequence: deliveries.map((_, index) => index).filter(index => 
            !deliveries[index].isStartPoint && !deliveries[index].isEndPoint
          )
        };
        
        if (route.deliverySequence.length > 0) {
          optimizedRoutes.push(route);
        }
      });
      
      setRoutes(optimizedRoutes);
      
      // Mock traffic data
      setTrafficData({
        overallMultiplier: 1.3,
        confidence: 0.85,
        source: 'AI Analysis',
        overallTrafficLevel: 'Medium',
        recommendations: [
          'Consider avoiding peak hours (8-10 AM, 6-8 PM)',
          'Route optimization completed successfully'
        ]
      });
      
      setIsOptimizing(false);
    }, 1500);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>AI-Based Dynamic Delivery Route Planner</h1>
        <button 
          onClick={optimizeRoutes} 
          disabled={isOptimizing || deliveries.length === 0 || vehicles.length === 0}
          className="optimize-btn"
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Routes'}
        </button>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <div className="tab-container">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'deliveries' ? 'active' : ''}`}
                onClick={() => setActiveTab('deliveries')}
              >
                📦 Deliveries
              </button>
              <button 
                className={`tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                🚛 Vehicles
              </button>
              <button 
                className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
                onClick={() => setActiveTab('routes')}
              >
                🗺️ Routes
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'deliveries' && (
                <DeliveryForm 
                  onAddDelivery={addDelivery} 
                  deliveries={deliveries}
                  onDeleteDelivery={deleteDelivery}
                />
              )}
              
              {activeTab === 'vehicles' && (
                <VehiclePanel 
                  vehicles={vehicles} 
                  onAddVehicle={addVehicle}
                />
              )}
              
              {activeTab === 'routes' && (
                <div className="routes-tab">
                  {routes.length === 0 ? (
                    <div className="no-routes">
                      <h3>🗺️ Optimized Routes</h3>
                      <p>No routes optimized yet. Add deliveries and vehicles, then click "Optimize Routes" to see results here.</p>
                    </div>
                  ) : (
                    <div className="routes-content">
                      <TrafficInsights trafficData={trafficData} routes={routes} />
                      
                      <div className="routes-list">
                        <h4>🗺️ Route Details ({routes.length})</h4>
                        {routes.map((route, index) => {
                          const accurateData = routeDetails.find(rd => rd.vehicleId === route.vehicleId);
                          const distance = accurateData ? accurateData.distance : (route.deliverySequence.length * 5);
                          const time = accurateData ? accurateData.time : (route.deliverySequence.length * 30);
                          const fuelCost = accurateData ? accurateData.fuelCost : ((distance / 15) * 96).toFixed(2);
                          
                          return (
                            <div key={index} className="route-detail-card">
                              <div className="route-header">
                                <h4>🚛 {route.vehicleId}</h4>
                                <span className="route-status">✅ Optimized</span>
                              </div>
                              
                              <div className="route-stats">
                                <div className="stat">
                                  <span className="icon">📦</span>
                                  <div>
                                    <div className="value">{route.deliverySequence.length}</div>
                                    <div className="label">Deliveries</div>
                                  </div>
                                </div>
                                
                                <div className="stat">
                                  <span className="icon">🛣️</span>
                                  <div>
                                    <div className="value">{distance} km</div>
                                    <div className="label">Distance</div>
                                  </div>
                                </div>
                                
                                <div className="stat">
                                  <span className="icon">⏱️</span>
                                  <div>
                                    <div className="value">{time} min</div>
                                    <div className="label">Duration</div>
                                  </div>
                                </div>
                                
                                <div className="stat">
                                  <span className="icon">⛽</span>
                                  <div>
                                    <div className="value">₹{fuelCost}</div>
                                    <div className="label">Fuel Cost</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="delivery-sequence">
                                <h5>📋 Route Sequence:</h5>
                                <div className="sequence-flow">
                                  <span className="depot">🏢 Depot</span>
                                  {route.deliverySequence.map((seq, idx) => (
                                    <React.Fragment key={idx}>
                                      <span className="arrow">→</span>
                                      <span className="delivery">📦 D{seq + 1}</span>
                                    </React.Fragment>
                                  ))}
                                  <span className="arrow">→</span>
                                  <span className="depot">🏢 Return</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="main-content">
          <div className="map-container">
            <MapView 
              deliveries={deliveries}
              vehicles={vehicles}
              routes={routes}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;