import React, { useState } from 'react';

const VehiclePanel = ({ vehicles, onAddVehicle }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    capacity: 10,
    latitude: 12.9716,
    longitude: 77.5946
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const vehicleData = {
      vehicleId: formData.vehicleId,
      capacity: parseInt(formData.capacity),
      currentLocation: {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
      }
    };

    onAddVehicle(vehicleData);
    setFormData({ vehicleId: '', capacity: 10, latitude: 12.9716, longitude: 77.5946 });
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="vehicle-panel">
      <div className="panel-header">
        <h3>🚛 Fleet Management ({vehicles.length})</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`toggle-btn ${showAddForm ? 'cancel' : 'add'}`}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add Vehicle'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-vehicle-form">
          <h4>🆕 New Vehicle</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>🚚 Vehicle ID:</label>
              <input
                type="text"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                placeholder="e.g., VH001, TRUCK-A"
                required
              />
            </div>

            <div className="form-group">
              <label>📦 Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>📍 Start Lat:</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>

              <div className="form-group half">
                <label>📍 Start Lng:</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              🚀 Deploy Vehicle
            </button>
          </form>
        </div>
      )}

      <div className="vehicle-list">
        <h4>🚛 Active Fleet</h4>
        {vehicles.map((vehicle, index) => (
          <div key={vehicle._id || index} className="vehicle-card">
            <div className="vehicle-header">
              <h4>🚚 {vehicle.vehicleId}</h4>
              <span className={`status ${vehicle.available ? 'available' : 'busy'}`}>
                {vehicle.available ? '🟢 Available' : '🔴 Busy'}
              </span>
            </div>
            <div className="vehicle-stats">
              <div className="stat">
                <span className="label">📦 Capacity:</span>
                <span className="value">{vehicle.capacity}</span>
              </div>
              <div className="stat">
                <span className="label">📍 Location:</span>
                <span className="value">
                  {vehicle.currentLocation.coordinates[1].toFixed(4)}, 
                  {vehicle.currentLocation.coordinates[0].toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclePanel;