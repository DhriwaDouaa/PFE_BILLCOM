package com.example.timesten.controller;

import com.example.timesten.dto.CustomerDTO;
import com.example.timesten.model.Customer;
import com.example.timesten.service.CustomerService;
import com.example.timesten.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository;

    @GetMapping
    public List<CustomerDTO> getAll() {
        return customerRepository.findAll()
            .stream()
            .map(c -> CustomerDTO.builder()
                .custId(c.getCustId())
                .name(c.getName())
                .codeClient(c.getCodeClient())
                .clientType(c.getClientType())
                .status(c.getStatus())
                .phone(c.getPhone())
                .age(c.getAge())
                .balance(c.getBalance())
                .verificationStatus(c.getVerificationStatus())
                .verificationDoc(c.getVerificationDoc())
                .build())
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return customerService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Customer>> getActiveWithMinBalance(
            @RequestParam(defaultValue = "0") BigDecimal minBalance) {
        return ResponseEntity.ok(customerService.findActiveWithMinBalance(minBalance));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        Customer created = customerService.create(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(
            @PathVariable Long id,
            @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.update(id, customer));
    }

    @PatchMapping("/{id}/balance")
    public ResponseEntity<Void> updateBalance(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal newBalance = body.get("balance");
        if (newBalance == null) {
            return ResponseEntity.badRequest().build();
        }
        customerService.updateBalance(id, newBalance);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        customerService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}