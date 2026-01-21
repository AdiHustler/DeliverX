import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = ({ deliveries, vehicles, routes, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const routingControlsRef = useRef([]);
  const colors = ['#3388ff', '#ff3333', '#33ff33', '#ffff33', '#ff33ff', '#33ffff'];

  // Clear existing routing controls
  const clearRoutes = () => {
    if (mapRef.current) {
      routingControlsRef.current.forEach(control => {
        try {
          if (control && mapRef.current.hasLayer && mapRef.current.hasLayer(control)) {
            mapRef.current.removeControl(control);
          }
        } catch (error) {
          console.warn('Error removing route control:', error);
        }
      });
      routingControlsRef.current = [];
    }
  };

  // Add road-based routes with hover tooltips
  useEffect(() => {
    if (!mapRef.current || routes.length === 0) {
      clearRoutes();
      return;
    }

    clearRoutes();
    const routeDetails = [];
    
    // Find start and end points
    const startPoint = deliveries.find(d => d.isStartPoint);
    const endPoint = deliveries.find(d => d.isEndPoint);
    const defaultStart = startPoint ? startPoint.location.coordinates : [77.5946, 12.9716];
    const defaultEnd = endPoint ? endPoint.location.coordinates : [77.5946, 12.9716];

    routes.forEach((route, routeIndex) => {
      const waypoints = [];
      
      // Add start point
      waypoints.push(L.latLng(defaultStart[1], defaultStart[0]));
      
      // Add delivery points in sequence (excluding start/end points)
      route.deliverySequence.forEach(deliveryIndex => {
        if (deliveries[deliveryIndex] && !deliveries[deliveryIndex].isStartPoint && !deliveries[deliveryIndex].isEndPoint) {
          const coords = deliveries[deliveryIndex].location.coordinates;
          waypoints.push(L.latLng(coords[1], coords[0]));
        }
      });
      
      // Add end point
      waypoints.push(L.latLng(defaultEnd[1], defaultEnd[0]));

      if (waypoints.length >= 2) {
        const routingControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          addWaypoints: false,
          createMarker: () => null,
          lineOptions: {
            styles: [{
              color: colors[routeIndex % colors.length],
              weight: 4,
              opacity: 0.8
            }]
          },
          show: false,
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          })
        });

        routingControl.on('routesfound', function(e) {
          try {
            const routeData = e.routes[0];
            const distanceKm = (routeData.summary.totalDistance / 1000).toFixed(2);
            const timeMinutes = Math.round(routeData.summary.totalTime / 60);
            
            const fuelNeeded = parseFloat(distanceKm) / 15;
            const fuelCost = (fuelNeeded * 96).toFixed(2);
            
            routeDetails.push({
              vehicleId: route.vehicleId,
              distance: distanceKm,
              time: timeMinutes,
              fuelCost: fuelCost,
              deliveries: route.deliverySequence.length
            });
            
            // Add hover tooltip to route line
            if (routingControl._line) {
              const nextDelivery = route.deliverySequence.length > 0 ? 
                deliveries[route.deliverySequence[0]]?.address || (endPoint?.address || 'End Point') : (endPoint?.address || 'End Point');
              
              const tooltipContent = `
                <div class="route-tooltip">
                  <h4>🚛 ${route.vehicleId}</h4>
                  <p><strong>📍 Next Stop:</strong> ${nextDelivery}</p>
                  <p><strong>🛣️ Distance:</strong> ${distanceKm} km</p>
                  <p><strong>⏱️ Duration:</strong> ${timeMinutes} min</p>
                  <p><strong>📦 Deliveries:</strong> ${route.deliverySequence.length}</p>
                  <p><strong>⛽ Fuel Cost:</strong> ₹${fuelCost}</p>
                </div>
              `;
              
              routingControl._line.bindTooltip(tooltipContent, {
                sticky: true,
                className: 'route-hover-tooltip'
              });
            }
            
            if (onRouteCalculated && routeDetails.length === routes.length) {
              onRouteCalculated([...routeDetails]);
            }
          } catch (error) {
            console.warn('Error processing route data:', error);
          }
        });

        try {
          routingControl.addTo(mapRef.current);
          routingControlsRef.current.push(routingControl);
        } catch (error) {
          console.warn('Error adding route control:', error);
        }
      }
    });
  }, [routes, deliveries, onRouteCalculated]);

  return (
    <MapContainer 
      center={[12.9716, 77.5946]} 
      zoom={11} 
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Delivery Markers */}
      {deliveries.map((delivery, index) => {
        const coords = delivery.location.coordinates;
        let icon = deliveryIcon;
        let title = `Delivery ${index + 1}`;
        
        if (delivery.isStartPoint) {
          icon = startIcon;
          title = 'Start Point';
        } else if (delivery.isEndPoint) {
          icon = endIcon;
          title = 'End Point';
        }
        
        return (
          <Marker 
            key={`delivery-${index}`}
            position={[coords[1], coords[0]]}
            icon={icon}
          >
            <Popup>
              <div>
                <h3>{title}</h3>
                <p>{delivery.address}</p>
                <p>Priority: {delivery.priority === 1 ? '🔴 High' : 
                           delivery.priority === 2 ? '🟡 Medium' : '🟢 Low'}</p>
                {delivery.isStartPoint && <p>🚀 Route Start</p>}
                {delivery.isEndPoint && <p>🏁 Route End</p>}
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Vehicle Markers */}
      {vehicles.map((vehicle, index) => {
        const coords = vehicle.currentLocation.coordinates;
        return (
          <Marker 
            key={`vehicle-${index}`}
            position={[coords[1], coords[0]]}
            icon={vehicleIcon}
          >
            <Popup>
              <div>
                <h3>🚛 Vehicle {vehicle.vehicleId}</h3>
                <p>📦 Capacity: {vehicle.capacity}</p>
                <p>Status: {vehicle.available ? '🟢 Available' : '🔴 Busy'}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;