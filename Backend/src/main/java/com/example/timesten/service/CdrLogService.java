package com.example.timesten.service;

import com.example.timesten.model.CdrLog;
import com.example.timesten.repository.CdrLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CdrLogService {

    @Autowired
    private CdrLogRepository cdrLogRepository;

    public List<CdrLog> getAll() {
        return cdrLogRepository.findAll();
    }

    public List<CdrLog> getByCustId(Long custId) {
        return cdrLogRepository.findByCustId(custId);
    }

    public CdrLog save(CdrLog cdr) {
        return cdrLogRepository.save(cdr);
    }

    public void delete(Long id) {
        cdrLogRepository.deleteById(id);
    }
}