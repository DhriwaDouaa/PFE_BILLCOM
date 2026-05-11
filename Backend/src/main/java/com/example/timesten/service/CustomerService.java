package com.example.timesten.service;

import com.example.timesten.model.Customer;
import com.example.timesten.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;

    // ── Lecture ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Customer> findAll() {
        log.debug("Fetching all customers");
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Customer> findById(Long id) {
        log.debug("Fetching customer id={}", id);
        return customerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Customer> findByStatus(String status) {
        return customerRepository.findByStatus(status.toUpperCase());
    }

    @Transactional(readOnly = true)
    public List<Customer> findActiveWithMinBalance(BigDecimal minBalance) {
        return customerRepository.findActiveCustomersWithMinBalance("ACTIVE", minBalance);
    }

    // ── Écriture ──────────────────────────────────────────────

    @Transactional
    public Customer create(Customer customer) {
        if (customerRepository.existsById(customer.getCustId())) {
            throw new IllegalArgumentException("Customer with id " + customer.getCustId() + " already exists");
        }
        log.info("Creating customer: {}", customer);
        return customerRepository.save(customer);
    }

    @Transactional
public Customer update(Long id, Customer updated) {
    return customerRepository.findById(id).map(existing -> {
        existing.setName(updated.getName());
        existing.setBalance(updated.getBalance());
        existing.setStatus(updated.getStatus());
        existing.setPhone(updated.getPhone());
        existing.setClientType(updated.getClientType());
        existing.setVerificationStatus(updated.getVerificationStatus());
        existing.setVerificationDoc(updated.getVerificationDoc());
        if (updated.getProfilePicture() != null && !updated.getProfilePicture().isEmpty()) {
            existing.setProfilePicture(updated.getProfilePicture());
        }
        log.info("Updating customer id={}", id);
        return customerRepository.save(existing);
    }).orElseThrow(() -> new RuntimeException("Customer not found: " + id));
}


    @Transactional
    public void updateBalance(Long id, BigDecimal newBalance) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        c.setBalance(newBalance);
        customerRepository.save(c);
        log.info("Updated balance for customer id={} -> {}", id, newBalance);
    }

    @Transactional
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found: " + id);
        }
        customerRepository.deleteById(id);
        log.info("Deleted customer id={}", id);
    }

    @Transactional
    public void deactivate(Long id) {
        int updated = customerRepository.updateStatus(id, "INACTIVE");
        if (updated == 0) throw new RuntimeException("Customer not found: " + id);
    }
}
