package com.example.timesten.controller;

import com.example.timesten.model.Invoice;
import com.example.timesten.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public List<Invoice> getAll() { return invoiceService.getAll(); }

    @GetMapping("/customer/{custId}")
    public List<Invoice> getByCustomer(@PathVariable Long custId) {
        return invoiceService.getByCustomer(custId);
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice i) { return invoiceService.save(i); }

    @PutMapping("/{id}")
    public Invoice update(@PathVariable Long id, @RequestBody Invoice i) {
        i.setInvoiceId(id);
        return invoiceService.save(i);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { invoiceService.delete(id); }
}