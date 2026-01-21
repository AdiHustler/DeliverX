import React, { useState } from 'react';
import axios from 'axios';

const DeliveryForm = ({ onAddDelivery, deliveries, onDeleteDelivery }) => {
  const [formData, setFormData] = useState({
    address: '',
    latitude: '',
    longitude: '',
    priority: 1,
    isStartPoint: false,
    isEndPoint: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const deliveryData = {
      address: formData.address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
      },
      priority: parseInt(formData.priority),
      isStartPoint: formData.isStartPoint,
      isEndPoint: formData.isEndPoint,
      timeWindow: {
        start: new Date(),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      }
    };

    onAddDelivery(deliveryData);
    setFormData({ address: '', latitude: '', longitude: '', priority: 1, isStartPoint: false, isEndPoint: false });
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const searchLocation = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=in`
      );
      
      // Filter and sort results for better relevance
      const filteredResults = response.data
        .filter(result => 
          result.class === 'place' || 
          result.class === 'boundary' ||
          (result.type && ['city', 'town', 'village', 'municipality'].includes(result.type))
        )
        .sort((a, b) => {
          // Prioritize exact matches and major cities
          const aScore = a.importance || 0;
          const bScore = b.importance || 0;
          return bScore - aScore;
        });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (location) => {
    setFormData({
      address: location.display_name,
      latitude: location.lat,
      longitude: location.lon,
      priority: 1
    });
    setSearchResults([]);
    setShowDropdown(false);
  };

  const sampleLocations = [
    { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi, Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 }
  ];

  const fillSampleLocation = (location) => {
    setFormData({
      address: location.name,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      priority: 1
    });
    setShowDropdown(false);
  };

  return (
    <div className="delivery-form">
      <h3>🚚 Add Delivery Point</h3>
      
      <div className="sample-locations">
        <h4>Quick Fill:</h4>
        <div className="dropdown-container">
          <select 
            onChange={(e) => {
              if (e.target.value) {
                const location = sampleLocations[parseInt(e.target.value)];
                fillSampleLocation(location);
                e.target.value = '';
              }
            }}
            className="sample-dropdown"
          >
            <option value="">🇮🇳 Select an Indian city...</option>
            {sampleLocations.map((location, index) => (
              <option key={index} value={index}>
                📍 {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>🔍 Search Location:</label>
          <div className="search-container">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={(e) => {
                handleChange(e);
                searchLocation(e.target.value);
              }}
              onFocus={() => formData.address.length >= 3 && setShowDropdown(true)}
              placeholder="Type Indian city/town name (e.g., Mumbai, Pune, Nashik)..."
              required
            />
            {isSearching && <div className="search-loading">🔄</div>}
          </div>
          
          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.slice(0, 5).map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => selectLocation(result)}
                >
                  📍 {result.display_name.split(',').slice(0, 3).join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Latitude:</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              required
              readOnly
            />
          </div>

          <div className="form-group half">
            <label>Longitude:</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              required
              readOnly
            />
          </div>
        </div>

        <div className="form-group">
          <label>⚡ Priority:</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="priority-select"
          >
            <option value={1}>🔴 High Priority</option>
            <option value={2}>🟡 Medium Priority</option>
            <option value={3}>🟢 Low Priority</option>
          </select>
        </div>

        <div className="form-group">
          <label>📍 Point Type:</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isStartPoint"
                checked={formData.isStartPoint}
                onChange={handleChange}
              />
              🚀 Start Point
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isEndPoint"
                checked={formData.isEndPoint}
                onChange={handleChange}
              />
              🏁 End Point
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          ➕ Add Delivery Point
        </button>
      </form>

      {/* Delivery List */}
      {deliveries.length > 0 && (
        <div className="delivery-list">
          <h4>📦 Added Deliveries ({deliveries.length})</h4>
          {deliveries.map((delivery, index) => (
            <div key={index} className="delivery-item">
              <div className="delivery-info">
                <div className="delivery-title">
                  📍 Delivery {index + 1}
                </div>
                <div className="delivery-address">
                  {delivery.address}
                </div>
                <div className="delivery-priority">
                  {delivery.isStartPoint && <span className="point-type">🚀 Start</span>}
                  {delivery.isEndPoint && <span className="point-type">🏁 End</span>}
                  Priority: {delivery.priority === 1 ? '🔴 High' : 
                           delivery.priority === 2 ? '🟡 Medium' : '🟢 Low'}
                </div>
              </div>
              <button 
                onClick={() => onDeleteDelivery(index)}
                className="delete-btn"
                title="Delete delivery"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryForm;