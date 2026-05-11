package com.example.timesten.service;

import com.example.timesten.model.Invoice;
import com.example.timesten.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public List<Invoice> getAll() { return invoiceRepository.findAll(); }
    public List<Invoice> getByCustomer(Long custId) { return invoiceRepository.findByCustId(custId); }
    public Invoice getById(Long id) { return invoiceRepository.findById(id).orElse(null); }
    public Invoice save(Invoice i) { return invoiceRepository.save(i); }
    public void delete(Long id) { invoiceRepository.deleteById(id); }
}