package com.example.timesten.repository;
import com.example.timesten.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AgentRepository extends JpaRepository<Agent, Long> {
    List<Agent> findBySupervisorId(Long supervisorId);
    List<Agent> findBySupervisorIdAndIsActive(Long supervisorId, Integer isActive);
}
