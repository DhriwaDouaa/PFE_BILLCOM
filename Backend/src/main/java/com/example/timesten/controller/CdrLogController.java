package com.example.timesten.controller;

import com.example.timesten.model.CdrLog;
import com.example.timesten.service.CdrLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cdr-logs")
public class CdrLogController {

    @Autowired
    private CdrLogService cdrLogService;

    @GetMapping
    public List<CdrLog> getAll() {
        return cdrLogService.getAll();
    }

    @GetMapping("/customer/{custId}")
    public List<CdrLog> getByCustId(@PathVariable Long custId) {
        return cdrLogService.getByCustId(custId);
    }

    @PostMapping
    public CdrLog create(@RequestBody CdrLog cdr) {
        return cdrLogService.save(cdr);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cdrLogService.delete(id);
    }
}


