package com.example.timesten.controller;

import com.example.timesten.model.IotData;
import com.example.timesten.model.Vehicle;
import com.example.timesten.repository.IotDataRepository;
import com.example.timesten.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/iot")
public class IotTelemetryController {

    @Autowired
    private IotDataRepository iotDataRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping("/telemetry/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getTelemetry(@PathVariable Long vehicleId) {
        Map<String, Object> data = new HashMap<>();

        // Chercher le dernier record IoT pour ce véhicule
        Optional<IotData> latestOpt = iotDataRepository.findLatestByVehicleId(vehicleId);

        if (latestOpt.isPresent()) {
            IotData iot = latestOpt.get();
            data.put("speed",       iot.getSpeed()       != null ? iot.getSpeed()       : 0.0);
            data.put("distanceKm",  0.0); // calculé côté frontend
            data.put("temperature", iot.getTemperature() != null ? iot.getTemperature() : 22.0);
            data.put("humidity",    iot.getHumidity()    != null ? iot.getHumidity()    : 0.0);
            data.put("battery",     iot.getBattery()     != null ? iot.getBattery()     : 0);
            data.put("latitude",    iot.getLatitude()    != null ? iot.getLatitude()    : 35.8356);
            data.put("longitude",   iot.getLongitude()   != null ? iot.getLongitude()   : 10.6150);
            data.put("climActive",  iot.getClimActive()  != null ? iot.getClimActive()  : 0);
            data.put("radioActive", iot.getRadioActive() != null ? iot.getRadioActive() : 0);
            data.put("wifiActive",  iot.getWifiActive()  != null ? iot.getWifiActive()  : 0);
            data.put("obstacle",    iot.getObstacle()    != null ? iot.getObstacle()    : 0);
            data.put("motion",      iot.getMotion()      != null ? iot.getMotion()      : 0);
            data.put("locked",      iot.getLocked()      != null ? iot.getLocked()      : 1);
            data.put("receivedAt",  iot.getReceivedAt()  != null ? iot.getReceivedAt().toString() : "");
            // Obstacles — OBSTACLE field = binary, on retourne 0 pour les 4 directions
            Map<String, Object> obs = new HashMap<>();
            int obstacleVal = iot.getObstacle() != null ? iot.getObstacle() * 30 : 0;
            obs.put("avant",   obstacleVal);
            obs.put("arriere", 0);
            obs.put("gauche",  0);
            obs.put("droite",  0);
            data.put("obstacles", obs);
        } else {
            // Fallback: chercher par vehicle dans VEHICLES table pour lat/lng
            Optional<Vehicle> vehOpt = vehicleRepository.findById(vehicleId);
            data.put("speed",      0.0);
            data.put("distanceKm", 0.0);
            data.put("temperature", 22.0);
            data.put("battery",    0);
            data.put("latitude",   vehOpt.map(Vehicle::getLatitude).orElse(35.8356));
            data.put("longitude",  vehOpt.map(Vehicle::getLongitude).orElse(10.6150));
            data.put("climActive", 0);
            data.put("radioActive",0);
            data.put("wifiActive", 0);
            data.put("obstacle",   0);
            data.put("motion",     0);
            data.put("locked",     1);
            Map<String, Object> obs = new HashMap<>();
            obs.put("avant", 0); obs.put("arriere", 0);
            obs.put("gauche", 0); obs.put("droite", 0);
            data.put("obstacles", obs);
        }

        return ResponseEntity.ok(data);
    }

    @GetMapping("/position/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getPosition(@PathVariable Long vehicleId) {
        Map<String, Object> pos = new HashMap<>();
        Optional<IotData> latestOpt = iotDataRepository.findLatestByVehicleId(vehicleId);
        if (latestOpt.isPresent()) {
            IotData iot = latestOpt.get();
            pos.put("latitude",  iot.getLatitude()  != null ? iot.getLatitude()  : 35.8356);
            pos.put("longitude", iot.getLongitude() != null ? iot.getLongitude() : 10.6150);
            pos.put("speed",     iot.getSpeed()     != null ? iot.getSpeed()     : 0.0);
        } else {
            Optional<Vehicle> vehOpt = vehicleRepository.findById(vehicleId);
            pos.put("latitude",  vehOpt.map(Vehicle::getLatitude).orElse(35.8356));
            pos.put("longitude", vehOpt.map(Vehicle::getLongitude).orElse(10.6150));
            pos.put("speed", 0.0);
        }
        return ResponseEntity.ok(pos);
    }

    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> sendCommand(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("success", true, "topic", body.get("topic")));
    }
}
