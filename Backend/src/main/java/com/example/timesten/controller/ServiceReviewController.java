package com.example.timesten.controller;

import com.example.timesten.model.ServiceReview;
import com.example.timesten.repository.ServiceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ServiceReviewController {

    @Autowired
    private ServiceReviewRepository reviewRepository;

    @GetMapping
    public List<ServiceReview> getAll() {
        return reviewRepository.findAll();
    }

    @GetMapping("/service/{serviceId}")
    public List<ServiceReview> getByService(@PathVariable Long serviceId) {
        return reviewRepository.findByServiceId(serviceId);
    }

    @GetMapping("/customer/{custId}")
    public List<ServiceReview> getByCustomer(@PathVariable Long custId) {
        return reviewRepository.findByCustId(custId);
    }

    @PostMapping
    public ServiceReview create(@RequestBody ServiceReview review) {
        review.setReviewDate(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reviewRepository.deleteById(id);
    }
}