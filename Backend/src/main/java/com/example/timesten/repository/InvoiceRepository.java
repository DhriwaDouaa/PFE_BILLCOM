package com.example.timesten.repository;

import com.example.timesten.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustId(Long custId);
    List<Invoice> findByStatus(String status);
}
