package com.airoute.optimizer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class OptimizerController {
    
    @Autowired
    private VRPSolver vrpSolver;
    
    @PostMapping("/optimize")
    public OptimizationResult optimize(@RequestBody OptimizationRequest request) {
        return vrpSolver.solve(request);
    }
    
    @GetMapping("/health")
    public String health() {
        return "Optimizer service is running";
    }
}