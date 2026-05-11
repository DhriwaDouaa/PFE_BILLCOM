package com.example.timesten.service;

import com.example.timesten.model.Service;
import com.example.timesten.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> getAll() { return serviceRepository.findAll(); }
    public List<Service> getActive() { return serviceRepository.findByStatus("ACTIVE"); }
    public Service getById(Long id) { return serviceRepository.findById(id).orElse(null); }
    public Service save(Service s) { return serviceRepository.save(s); }
    public void delete(Long id) { serviceRepository.deleteById(id); }
}
