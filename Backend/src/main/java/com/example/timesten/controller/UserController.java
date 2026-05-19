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
import java.util.Optional;
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
            // 1. Vérifier unicité email
            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());
            if (existingEmail.isPresent()) {
                return ResponseEntity.badRequest()
                        .body("Un compte avec cet email existe déjà.");
            }

            // 2. Vérifier unicité username (nom complet)
            Optional<User> existingName = userRepository.findByUsername(user.getUsername());
            if (existingName.isPresent()) {
                return ResponseEntity.badRequest()
                        .body("Un compte avec ce nom existe déjà.");
            }

            // 3. Si custId fourni → utiliser tel quel (admin créant un user pour customer
            // existant)
            if (user.getCustId() != null) {
                User savedUser = userRepository.save(user);
                return ResponseEntity.ok(savedUser);
            }

            // 4. Si custId null → signup normal → créer customer d'abord
            long maxCustId = customerRepository.findAll()
                    .stream()
                    .mapToLong(c -> c.getCustId() != null ? c.getCustId() : 0L)
                    .max()
                    .orElse(0L);
            long newCustId = maxCustId + 1;

            Customer customer = new Customer();
            customer.setCustId(newCustId);
            customer.setName(user.getUsername());
            customer.setStatus("EN_ATTENTE");
            customer.setBalance(BigDecimal.ZERO);
            customer.setClientType("STANDARD");
            customer.setVerificationStatus("PENDING");
            Customer savedCustomer = customerRepository.save(customer);

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