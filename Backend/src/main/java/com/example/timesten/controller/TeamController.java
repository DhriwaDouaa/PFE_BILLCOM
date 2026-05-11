package com.example.timesten.controller;

import com.example.timesten.model.TeamAssignment;
import com.example.timesten.model.User;
import com.example.timesten.repository.TeamAssignmentRepository;
import com.example.timesten.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    @Autowired
    private TeamAssignmentRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    // Récupérer les assignments d'un supervisor
    @GetMapping("/supervisor/{supervisorId}")
    public List<TeamAssignment> getBySupervisor(@PathVariable Long supervisorId) {
        return teamRepo.findBySupervisorId(supervisorId);
    }

    // Récupérer les agents d'un supervisor
    @GetMapping("/agents/{supervisorId}")
    public List<Map<String, Object>> getAgents(@PathVariable Long supervisorId) {
        List<TeamAssignment> assignments = teamRepo.findBySupervisorId(supervisorId);
        Set<Long> agentIds = assignments.stream()
            .map(TeamAssignment::getAgentId)
            .collect(Collectors.toSet());

        List<Map<String, Object>> agents = new ArrayList<>();
        for (Long agentId : agentIds) {
            userRepo.findById(agentId).ifPresent(user -> {
                Map<String, Object> agentMap = new HashMap<>();
                agentMap.put("agentId", user.getUserId());
                agentMap.put("username", user.getUsername());
                agentMap.put("email", user.getEmail());
                agentMap.put("role", user.getRole());
                List<Long> custIds = assignments.stream()
                    .filter(a -> a.getAgentId().equals(agentId))
                    .map(TeamAssignment::getCustId)
                    .collect(Collectors.toList());
                agentMap.put("customers", custIds);
                agents.add(agentMap);
            });
        }
        return agents;
    }

    // Récupérer les clients d'un agent
    @GetMapping("/agent/{agentId}/customers")
    public List<Long> getAgentCustomers(@PathVariable Long agentId) {
        return teamRepo.findByAgentId(agentId).stream()
            .map(TeamAssignment::getCustId)
            .collect(Collectors.toList());
    }
}
