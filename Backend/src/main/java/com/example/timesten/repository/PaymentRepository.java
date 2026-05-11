package com.example.timesten.repository;

import com.example.timesten.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustId(Long custId);
    List<Payment> findByInvoiceId(Long invoiceId);
}
