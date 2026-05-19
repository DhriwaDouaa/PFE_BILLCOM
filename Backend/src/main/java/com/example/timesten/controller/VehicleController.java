package com.example.timesten.controller;
import com.example.timesten.model.Vehicle;
import com.example.timesten.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    @Autowired
    private VehicleRepository vehicleRepository;
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }
    @GetMapping("/disponibles")
    public ResponseEntity<List<Vehicle>> getDisponibles() {
        return ResponseEntity.ok(vehicleRepository.findByStatut("DISPONIBLE"));
    }
    @PostMapping
    public ResponseEntity<Vehicle> create(@RequestBody Vehicle v) {
        return ResponseEntity.ok(vehicleRepository.save(v));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle v) {
        v.setVehicleId(id); return ResponseEntity.ok(vehicleRepository.save(v));
    }
}
