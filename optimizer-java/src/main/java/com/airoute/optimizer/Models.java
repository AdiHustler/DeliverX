package com.airoute.optimizer;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

// Request Models
class OptimizationRequest {
    private List<Delivery> deliveries;
    private List<Vehicle> vehicles;
    private TrafficData trafficData;
    
    // Getters and setters
    public List<Delivery> getDeliveries() { return deliveries; }
    public void setDeliveries(List<Delivery> deliveries) { this.deliveries = deliveries; }
    public List<Vehicle> getVehicles() { return vehicles; }
    public void setVehicles(List<Vehicle> vehicles) { this.vehicles = vehicles; }
    public TrafficData getTrafficData() { return trafficData; }
    public void setTrafficData(TrafficData trafficData) { this.trafficData = trafficData; }
}

class Delivery {
    private String id;
    private String address;
    private GeoLocation location;
    private int priority;
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public GeoLocation getLocation() { return location; }
    public void setLocation(GeoLocation location) { this.location = location; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
}

class Vehicle {
    private String vehicleId;
    private int capacity;
    private GeoLocation currentLocation;
    
    // Getters and setters
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public GeoLocation getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(GeoLocation currentLocation) { this.currentLocation = currentLocation; }
}

class GeoLocation {
    private String type;
    private double[] coordinates;
    
    // Getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double[] getCoordinates() { return coordinates; }
    public void setCoordinates(double[] coordinates) { this.coordinates = coordinates; }
}

class TrafficData {
    private double multiplier;
    
    // Getters and setters
    public double getMultiplier() { return multiplier; }
    public void setMultiplier(double multiplier) { this.multiplier = multiplier; }
}

// Response Models
class OptimizationResult {
    private List<Route> routes;
    private double totalDistance;
    
    // Getters and setters
    public List<Route> getRoutes() { return routes; }
    public void setRoutes(List<Route> routes) { this.routes = routes; }
    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }
}

class Route {
    private String vehicleId;
    private List<Integer> deliverySequence;
    private double estimatedTime;
    
    // Getters and setters
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    public List<Integer> getDeliverySequence() { return deliverySequence; }
    public void setDeliverySequence(List<Integer> deliverySequence) { this.deliverySequence = deliverySequence; }
    public double getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(double estimatedTime) { this.estimatedTime = estimatedTime; }
}