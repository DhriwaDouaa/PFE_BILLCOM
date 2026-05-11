package com.example.timesten.controller;

import com.example.timesten.model.IotData;
import com.example.timesten.repository.IotDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/iot")
public class IotController {

    @Autowired
    private IotDataRepository iotDataRepository;

    // Recevoir données ESP32
    @PostMapping("/data")
    public ResponseEntity<IotData> receiveData(@RequestBody IotData data) {
        data.setReceivedAt(LocalDateTime.now());
        IotData saved = iotDataRepository.save(data);
        return ResponseEntity.ok(saved);
    }

    // Récupérer toutes les données IoT
    @GetMapping("/data")
    public List<IotData> getAll() {
        return iotDataRepository.findAll();
    }

    // Récupérer dernière donnée d'un client
    @GetMapping("/data/customer/{custId}/latest")
    public ResponseEntity<IotData> getLatest(@PathVariable Long custId) {
        Optional<IotData> data = iotDataRepository
            .findTopByCustIdOrderByReceivedAtDesc(custId);
        return data.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Récupérer historique d'un client
    @GetMapping("/data/customer/{custId}")
    public List<IotData> getByCustomer(@PathVariable Long custId) {
        return iotDataRepository.findByCustId(custId);
    }
}
