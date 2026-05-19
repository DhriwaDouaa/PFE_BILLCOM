package com.example.timesten.repository;
import com.example.timesten.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatut(String statut);
}
