package com.example.timesten.controller;

import com.example.timesten.model.Agent;
import com.example.timesten.model.Customer;
import com.example.timesten.model.Supervisor;
import com.example.timesten.model.User;
import com.example.timesten.repository.AgentRepository;
import com.example.timesten.repository.CustomerRepository;
import com.example.timesten.repository.SupervisorRepository;
import com.example.timesten.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
@Slf4j
public class SupervisorController {

    private final SupervisorRepository supervisorRepository;
    private final AgentRepository agentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    // ── GET DASHBOARD ─────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam Long userId) {

        Supervisor supervisor = supervisorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));

        User supUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Agent> agents = agentRepository.findBySupervisorId(supervisor.getSupervisorId());

        List<Map<String, Object>> agentList = agents.stream().map(agent -> {
            User agentUser = userRepository.findById(agent.getUserId()).orElse(null);
            List<Customer> clients = customerRepository.findByAgentId(agent.getAgentId());

            List<Map<String, Object>> clientList = clients.stream().map(c -> {
                Map<String, Object> cm = new HashMap<>();
                cm.put("custId", c.getCustId());
                cm.put("name", c.getName());
                cm.put("phone", c.getPhone());
                cm.put("clientType", c.getClientType());
                cm.put("balance", c.getBalance());
                cm.put("missionStatus", "idle"); // sera enrichi par IoT
                return cm;
            }).collect(Collectors.toList());

            Map<String, Object> am = new HashMap<>();
            am.put("agentId", agent.getAgentId());
            am.put("userId", agent.getUserId());
            am.put("name", agentUser != null ? agentUser.getUsername() : "Agent #" + agent.getAgentId());
            am.put("speciality", agent.getSpeciality());
            am.put("isActive", agent.getIsActive() == 1);
            am.put("clients", clientList);
            return am;
        }).collect(Collectors.toList());

        // Stats
        int totalClients = agentList.stream()
                .mapToInt(a -> ((List<?>) a.get("clients")).size()).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAgents", agents.size());
        stats.put("totalClients", totalClients);
        stats.put("activeMissions", 0);
        stats.put("todayRevenue", 0.0);

        Map<String, Object> response = new HashMap<>();
        response.put("name", supUser.getUsername());
        response.put("department", supervisor.getDepartment());
        response.put("stats", stats);
        response.put("agents", agentList);
        response.put("activeMissions", Collections.emptyList());

        return ResponseEntity.ok(response);
    }

    // ── GET AGENTS ────────────────────────────────────────────────
    @GetMapping("/agents")
    public ResponseEntity<List<Agent>> getAgents(@RequestParam Long userId) {
        Supervisor supervisor = supervisorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));
        return ResponseEntity.ok(agentRepository.findBySupervisorId(supervisor.getSupervisorId()));
    }

    // ── GET CLIENTS PAR AGENT ─────────────────────────────────────
    @GetMapping("/agents/{agentId}/clients")
    public ResponseEntity<List<Customer>> getClientsByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(customerRepository.findByAgentId(agentId));
    }

    // ── ASSIGNER CLIENT A UN AGENT ────────────────────────────────
    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignClient(
            @RequestBody Map<String, Object> body) {

        Long agentId = Long.valueOf(body.get("agentId").toString());
        String clientName = body.get("clientName").toString();

        // Chercher le client par nom
        List<Customer> matches = customerRepository.findAll().stream()
                .filter(c -> c.getName() != null &&
                        c.getName().toLowerCase().contains(clientName.toLowerCase()))
                .collect(Collectors.toList());

        if (matches.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Client '" + clientName + "' non trouvé"));
        }

        Customer customer = matches.get(0);
        customer.setAgentId(agentId);
        customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Client " + customer.getName() + " assigné à l'agent #" + agentId,
                "custId", customer.getCustId()
        ));
    }

    // ── DESASSIGNER CLIENT ────────────────────────────────────────
    @DeleteMapping("/assign/{agentId}/{custId}")
    public ResponseEntity<Void> unassignClient(
            @PathVariable Long agentId,
            @PathVariable Long custId) {

        customerRepository.findById(custId).ifPresent(c -> {
            c.setAgentId(null);
            customerRepository.save(c);
        });
        return ResponseEntity.noContent().build();
    }

    // ── MISSIONS ACTIVES ──────────────────────────────────────────
    @GetMapping("/missions/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveMissions(
            @RequestParam Long userId) {
        // Sera enrichi par les données IoT temps réel
        // Pour l'instant retourne liste vide
        return ResponseEntity.ok(Collections.emptyList());
    }
    @PostMapping("/agents/add")
    public ResponseEntity<Map<String, Object>> addAgent(@RequestParam Long userId, @RequestBody Map<String, String> body) {
        Supervisor supervisor = supervisorRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Supervisor not found"));
        User newUser = new User();
        newUser.setUserId(System.currentTimeMillis() % 100000);
        newUser.setUsername(body.get("username"));
        newUser.setEmail(body.get("email"));
        newUser.setPassword(body.get("password"));
        newUser.setRole("AGENT");
        userRepository.save(newUser);
        Agent newAgent = new Agent();
        newAgent.setAgentId(System.currentTimeMillis() % 100000 + 1);
        newAgent.setUserId(newUser.getUserId());
        newAgent.setSupervisorId(supervisor.getSupervisorId());
        newAgent.setSpeciality(body.get("speciality"));
        newAgent.setIsActive(1);
        newAgent.setHiredAt(java.time.LocalDateTime.now());
        agentRepository.save(newAgent);
        return ResponseEntity.ok(Map.of("success", true, "message", "Agent créé avec succès"));
    }

    @GetMapping("/clients")
    public ResponseEntity<List<Customer>> getSupervisorClients(@RequestParam Long userId) {
        Supervisor supervisor = supervisorRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Supervisor not found"));
        List<Agent> agents = agentRepository.findBySupervisorId(supervisor.getSupervisorId());
        List<Long> agentIds = agents.stream().map(Agent::getAgentId).collect(Collectors.toList());
        List<Customer> clients = customerRepository.findAll().stream().filter(c -> c.getAgentId() != null && agentIds.contains(c.getAgentId())).collect(Collectors.toList());
        return ResponseEntity.ok(clients);
    }
    @GetMapping("/agents/full")
    public ResponseEntity<List<Map<String, Object>>> getAgentsFull(@RequestParam Long userId) {
        Supervisor supervisor = supervisorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));
        List<Agent> agents = agentRepository.findBySupervisorId(supervisor.getSupervisorId());
        List<Map<String, Object>> result = agents.stream().map(a -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("agentId", a.getAgentId());
            m.put("userId", a.getUserId());
            m.put("speciality", a.getSpeciality());
            m.put("isActive", a.getIsActive() == 1);
            m.put("hiredAt", a.getHiredAt() != null ? a.getHiredAt().toString().substring(0, 10) : "");
            m.put("clientCount", customerRepository.findByAgentId(a.getAgentId()).size());
            userRepository.findById(a.getUserId()).ifPresent(u -> {
                m.put("name", u.getUsername());
                m.put("email", u.getEmail());
            });
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
    @GetMapping("/clients/unassigned")
    public ResponseEntity<List<Map<String, Object>>> getUnassignedClients() {
        List<Map<String, Object>> result = customerRepository.findAll().stream()
            .filter(c -> c.getAgentId() == null)
            .map(c -> {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("custId", c.getCustId());
                m.put("name", c.getName());
                m.put("phone", c.getPhone() != null ? c.getPhone() : "—");
                m.put("clientType", c.getClientType());
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/assign/by-id")
    public ResponseEntity<Map<String, Object>> assignById(@RequestBody Map<String, Object> body) {
        Long agentId = Long.valueOf(body.get("agentId").toString());
        Long custId = Long.valueOf(body.get("custId").toString());
        Customer customer = customerRepository.findById(custId)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        customer.setAgentId(agentId);
        customerRepository.save(customer);
        return ResponseEntity.ok(Map.of("success", true, "message", customer.getName() + " assigné à l'agent #" + agentId));
    }
}
