import React from 'react';

const TrafficInsights = ({ trafficData, routes }) => {
  if (!trafficData) return null;

  const getTrafficLevel = (multiplier) => {
    if (multiplier >= 2.0) return { level: 'Heavy', color: '#ef4444', icon: '🔴' };
    if (multiplier >= 1.5) return { level: 'Moderate', color: '#f59e0b', icon: '🟡' };
    if (multiplier >= 1.2) return { level: 'Light', color: '#10b981', icon: '🟢' };
    return { level: 'Free Flow', color: '#06b6d4', icon: '🔵' };
  };

  const traffic = getTrafficLevel(trafficData.overallMultiplier);

  return (
    <div className="traffic-insights">
      <div className="insights-header">
        <h4>🚦 AI Traffic Analysis</h4>
        <div className="traffic-badge" style={{ backgroundColor: traffic.color }}>
          {traffic.icon} {traffic.level}
        </div>
      </div>
      
      <div className="insights-content">
        <div className="traffic-stats">
          <div className="stat">
            <span className="label">Traffic Multiplier:</span>
            <span className="value">{trafficData.overallMultiplier.toFixed(2)}x</span>
          </div>
          
          <div className="stat">
            <span className="label">Confidence:</span>
            <span className="value">{(trafficData.confidence * 100).toFixed(0)}%</span>
          </div>
          
          <div className="stat">
            <span className="label">Source:</span>
            <span className="value">{trafficData.source}</span>
          </div>
        </div>
        
        {trafficData.recommendations && trafficData.recommendations.length > 0 && (
          <div className="recommendations">
            <h5>💡 Recommendations:</h5>
            <ul>
              {trafficData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {routes && routes.length > 0 && (
          <div className="route-impact">
            <h5>📊 Route Impact:</h5>
            {routes.map((route, index) => (
              <div key={index} className="route-impact-item">
                <span className="route-name">🚛 {route.vehicleId}</span>
                <span className="impact-time">
                  +{((route.estimatedTime - (route.deliverySequence.length * 5)) * 60 / route.deliverySequence.length).toFixed(0)} min delay
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficInsights;