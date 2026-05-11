package com.example.timesten.controller;

import com.example.timesten.dto.UserDTO;
import com.example.timesten.model.Customer;
import com.example.timesten.model.User;
import com.example.timesten.repository.CustomerRepository;
import com.example.timesten.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<UserDTO> getAll() {
        return userRepository.findAll()
            .stream()
            .map(u -> UserDTO.builder()
                .userId(u.getUserId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .custId(u.getCustId())
                .build())
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody User user) {
        try {
            // 1. Créer le customer
            long custId = System.currentTimeMillis() % 100000;
            Customer customer = new Customer();
            customer.setCustId(custId);
            customer.setName(user.getUsername());
            customer.setStatus("ACTIVE");
            customer.setBalance(BigDecimal.ZERO);
            customer.setClientType("STANDARD");
            customer.setVerificationStatus("PENDING");
            Customer savedCustomer = customerRepository.save(customer);

            // 2. Créer le user avec le custId
            user.setCustId(savedCustomer.getCustId());
            User savedUser = userRepository.save(user);

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}