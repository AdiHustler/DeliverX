package com.airoute.optimizer;

import com.google.ortools.Loader;
import com.google.ortools.constraintsolver.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class VRPSolver {
    
    static {
        Loader.loadNativeLibraries();
    }
    
    public OptimizationResult solve(OptimizationRequest request) {
        int numVehicles = request.getVehicles().size();
        int numLocations = request.getDeliveries().size() + 1; // +1 for depot
        
        // Create distance matrix
        long[][] distanceMatrix = createDistanceMatrix(request);
        
        // Create routing model
        RoutingIndexManager manager = new RoutingIndexManager(numLocations, numVehicles, 0);
        RoutingModel routing = new RoutingModel(manager);
        
        // Create distance callback
        final int transitCallbackIndex = routing.registerTransitCallback((long fromIndex, long toIndex) -> {
            int fromNode = manager.indexToNode(fromIndex);
            int toNode = manager.indexToNode(toIndex);
            return distanceMatrix[fromNode][toNode];
        });
        
        routing.setArcCostEvaluatorOfAllVehicles(transitCallbackIndex);
        
        // Add capacity constraint
        final int demandCallbackIndex = routing.registerUnaryTransitCallback((long fromIndex) -> {
            int fromNode = manager.indexToNode(fromIndex);
            return fromNode == 0 ? 0 : 1; // Each delivery has demand of 1
        });
        
        routing.addDimensionWithVehicleCapacity(
            demandCallbackIndex, 0, new long[]{10, 10, 10}, true, "Capacity");
        
        // Set search parameters
        RoutingSearchParameters searchParameters = main.defaultRoutingSearchParameters()
            .toBuilder()
            .setFirstSolutionStrategy(FirstSolutionStrategy.Value.PATH_CHEAPEST_ARC)
            .build();
        
        // Solve
        Assignment solution = routing.solveWithParameters(searchParameters);
        
        if (solution != null) {
            return extractSolution(solution, manager, routing, request);
        }
        
        return new OptimizationResult();
    }
    
    private long[][] createDistanceMatrix(OptimizationRequest request) {
        int size = request.getDeliveries().size() + 1;
        long[][] matrix = new long[size][size];
        
        // Simple Euclidean distance calculation
        List<Location> locations = new ArrayList<>();
        locations.add(new Location(0, 0)); // Depot
        
        for (Delivery delivery : request.getDeliveries()) {
            locations.add(new Location(
                delivery.getLocation().getCoordinates()[0],
                delivery.getLocation().getCoordinates()[1]
            ));
        }
        
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                if (i == j) {
                    matrix[i][j] = 0;
                } else {
                    double distance = calculateDistance(locations.get(i), locations.get(j));
                    // Apply traffic multiplier
                    double trafficMultiplier = request.getTrafficData().getMultiplier();
                    matrix[i][j] = (long) (distance * trafficMultiplier * 1000); // Convert to meters
                }
            }
        }
        
        return matrix;
    }
    
    private double calculateDistance(Location loc1, Location loc2) {
        double lat1 = Math.toRadians(loc1.getLat());
        double lon1 = Math.toRadians(loc1.getLon());
        double lat2 = Math.toRadians(loc2.getLat());
        double lon2 = Math.toRadians(loc2.getLon());
        
        double dlat = lat2 - lat1;
        double dlon = lon2 - lon1;
        
        double a = Math.sin(dlat/2) * Math.sin(dlat/2) + 
                   Math.cos(lat1) * Math.cos(lat2) * 
                   Math.sin(dlon/2) * Math.sin(dlon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return 6371 * c; // Earth radius in km
    }
    
    private OptimizationResult extractSolution(Assignment solution, RoutingIndexManager manager, 
                                             RoutingModel routing, OptimizationRequest request) {
        OptimizationResult result = new OptimizationResult();
        List<Route> routes = new ArrayList<>();
        
        for (int vehicleId = 0; vehicleId < request.getVehicles().size(); vehicleId++) {
            Route route = new Route();
            route.setVehicleId(request.getVehicles().get(vehicleId).getVehicleId());
            
            List<Integer> routeDeliveries = new ArrayList<>();
            long index = routing.start(vehicleId);
            
            while (!routing.isEnd(index)) {
                int nodeIndex = manager.indexToNode(index);
                if (nodeIndex != 0) { // Skip depot
                    routeDeliveries.add(nodeIndex - 1); // Adjust for depot offset
                }
                index = solution.value(routing.nextVar(index));
            }
            
            route.setDeliverySequence(routeDeliveries);
            route.setEstimatedTime(solution.objectiveValue() / 1000.0); // Convert back to km
            routes.add(route);
        }
        
        result.setRoutes(routes);
        result.setTotalDistance(solution.objectiveValue() / 1000.0);
        return result;
    }
    
    private static class Location {
        private double lat, lon;
        
        public Location(double lat, double lon) {
            this.lat = lat;
            this.lon = lon;
        }
        
        public double getLat() { return lat; }
        public double getLon() { return lon; }
    }
}