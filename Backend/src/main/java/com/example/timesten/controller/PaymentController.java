package com.example.timesten.controller;

import com.example.timesten.model.Payment;
import com.example.timesten.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public List<Payment> getAll() { return paymentService.getAll(); }

    @GetMapping("/customer/{custId}")
    public List<Payment> getByCustomer(@PathVariable Long custId) {
        return paymentService.getByCustomer(custId);
    }

    @PostMapping
    public Payment create(@RequestBody Payment p) { return paymentService.save(p); }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment p) {
        p.setPaymentId(id);
        return ResponseEntity.ok(paymentService.save(p));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { paymentService.delete(id); }
}
