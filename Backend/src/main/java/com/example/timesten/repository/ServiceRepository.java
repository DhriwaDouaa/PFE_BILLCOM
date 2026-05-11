package com.example.timesten.repository;

import com.example.timesten.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByStatus(String status);
    List<Service> findByBillingModel(String billingModel);
}