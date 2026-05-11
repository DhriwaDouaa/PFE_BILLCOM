package com.example.timesten.controller;

import com.example.timesten.model.UserLog;
import com.example.timesten.repository.UserLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user-logs")
public class UserLogController {

    @Autowired
    private UserLogRepository userLogRepository;

    @GetMapping
    public List<UserLog> getAll() {
        return userLogRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<UserLog> getByUser(@PathVariable Long userId) {
        return userLogRepository.findByUserId(userId);
    }

    @GetMapping("/role/{role}")
    public List<UserLog> getByRole(@PathVariable String role) {
        return userLogRepository.findByRole(role);
    }

    @PostMapping
    public UserLog create(@RequestBody UserLog log) {
        return userLogRepository.save(log);
    }
}