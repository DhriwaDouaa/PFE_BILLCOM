package com.example.timesten.controller;

import com.example.timesten.model.Service;
import com.example.timesten.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public List<Service> getAll() { return serviceService.getAll(); }

    @GetMapping("/{id}")
    public Service getById(@PathVariable Long id) { return serviceService.getById(id); }

    @PostMapping
    public Service create(@RequestBody Service s) { return serviceService.save(s); }

    @PutMapping("/{id}")
    public Service update(@PathVariable Long id, @RequestBody Service s) {
        s.setServiceId(id);
        return serviceService.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { serviceService.delete(id); }
}