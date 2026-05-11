package com.example.timesten.repository;

import com.example.timesten.model.ServiceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceReviewRepository extends JpaRepository<ServiceReview, Long> {
    List<ServiceReview> findByServiceId(Long serviceId);
    List<ServiceReview> findByCustId(Long custId);
}