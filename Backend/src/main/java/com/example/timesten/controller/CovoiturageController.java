package com.example.timesten.controller;

import com.example.timesten.model.CovoiturageRequest;
import com.example.timesten.repository.CovoiturageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/covoiturage")
public class CovoiturageController {

    @Autowired
    private CovoiturageRepository repo;

    // Client B yb3ath demande covoiturage
    @PostMapping("/request")
    public ResponseEntity<CovoiturageRequest> createRequest(@RequestBody Map<String, Object> body) {
        CovoiturageRequest req = CovoiturageRequest.builder()
            .vehicleId(Long.valueOf(body.get("vehicleId").toString()))
            .custId(Long.valueOf(body.get("custId").toString()))
            .distance(body.get("distance") != null ? Double.valueOf(body.get("distance").toString()) : 0.0)
            .status("PENDING")
            .createdAt(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(repo.save(req));
    }

    // Client A (conducteur) ychouf les demandes en attente
    @GetMapping("/pending/{vehicleId}")
    public ResponseEntity<List<CovoiturageRequest>> getPending(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(repo.findPendingByVehicleId(vehicleId));
    }

    // Client A yqbal la demande
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Map<String, Object>> accept(@PathVariable Long requestId) {
        Optional<CovoiturageRequest> opt = repo.findById(requestId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        CovoiturageRequest req = opt.get();
        req.setStatus("ACCEPTED");
        repo.save(req);
        return ResponseEntity.ok(Map.of("success", true, "status", "ACCEPTED"));
    }

    // Client A yrefus la demande
    @PostMapping("/refuse/{requestId}")
    public ResponseEntity<Map<String, Object>> refuse(@PathVariable Long requestId) {
        Optional<CovoiturageRequest> opt = repo.findById(requestId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        CovoiturageRequest req = opt.get();
        req.setStatus("REFUSED");
        repo.save(req);
        return ResponseEntity.ok(Map.of("success", true, "status", "REFUSED"));
    }

    // Nombre passagers actuels dans le véhicule
    @GetMapping("/passengers/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getPassengers(@PathVariable Long vehicleId) {
        List<CovoiturageRequest> accepted = repo.findAcceptedByVehicleId(vehicleId);
        return ResponseEntity.ok(Map.of(
            "count", accepted.size() + 1, // +1 pour le conducteur
            "max", 4,
            "passengers", accepted
        ));
    }

    // Client ychouf status mta3 demandtou
    @GetMapping("/status/{custId}")
    public ResponseEntity<List<CovoiturageRequest>> getStatus(@PathVariable Long custId) {
        return ResponseEntity.ok(repo.findByCustId(custId));
    }
}
