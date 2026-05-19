package com.example.timesten.controller;
import com.example.timesten.model.Agent;
import com.example.timesten.model.Customer;
import com.example.timesten.model.User;
import com.example.timesten.repository.AgentRepository;
import com.example.timesten.repository.CustomerRepository;
import com.example.timesten.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {
    private final AgentRepository agentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam Long userId) {
        Agent agent = agentRepository.findAll().stream()
            .filter(a -> a.getUserId().equals(userId)).findFirst()
            .orElseThrow(() -> new RuntimeException("Agent not found"));
        User user = userRepository.findById(userId).orElse(null);
        List<Customer> customers = customerRepository.findByAgentId(agent.getAgentId());
        List<Map<String, Object>> clientList = customers.stream().map(c -> {
            Map<String, Object> cm = new HashMap<>();
            cm.put("custId", c.getCustId());
            cm.put("name", c.getName());
            cm.put("phone", c.getPhone());
            cm.put("clientType", c.getClientType());
            cm.put("balance", c.getBalance());
            cm.put("missionStatus", "idle");
            return cm;
        }).collect(Collectors.toList());
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClients", clientList.size());
        stats.put("activeMissions", 0);
        stats.put("todayRevenue", 0.0);
        stats.put("completedToday", 0);
        Map<String, Object> response = new HashMap<>();
        response.put("name", user != null ? user.getUsername() : "Agent");
        response.put("speciality", agent.getSpeciality());
        response.put("clients", clientList);
        response.put("stats", stats);
        return ResponseEntity.ok(response);
    }
}
