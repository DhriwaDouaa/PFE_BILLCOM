package com.example.timesten.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/iot")
public class IotTelemetryController {
    @GetMapping("/telemetry/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getTelemetry(@PathVariable String vehicleId) {
        Map<String, Object> data = new HashMap<>();
        data.put("speed", 0);
        data.put("distanceKm", 0.0);
        data.put("temperature", 22);
        data.put("battery", 87);
        data.put("latitude", 35.8356);
        data.put("longitude", 10.6150);
        Map<String, Object> obs = new HashMap<>();
        obs.put("avant", 0); obs.put("arriere", 0);
        obs.put("gauche", 0); obs.put("droite", 0);
        data.put("obstacles", obs);
        return ResponseEntity.ok(data);
    }
    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> sendCommand(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("success", true, "topic", body.get("topic")));
    }
}
