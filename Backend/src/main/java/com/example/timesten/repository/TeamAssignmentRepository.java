package com.example.timesten.repository;

import com.example.timesten.model.TeamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamAssignmentRepository extends JpaRepository<TeamAssignment, Long> {
    List<TeamAssignment> findBySupervisorId(Long supervisorId);
    List<TeamAssignment> findByAgentId(Long agentId);
}
