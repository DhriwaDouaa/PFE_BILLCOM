package com.example.timesten.service;

import com.example.timesten.model.Payment;
import com.example.timesten.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Payment> getAll() { return paymentRepository.findAll(); }
    public List<Payment> getByCustomer(Long custId) { return paymentRepository.findByCustId(custId); }
    public Payment save(Payment p) { return paymentRepository.save(p); }
    public void delete(Long id) { paymentRepository.deleteById(id); }
}
