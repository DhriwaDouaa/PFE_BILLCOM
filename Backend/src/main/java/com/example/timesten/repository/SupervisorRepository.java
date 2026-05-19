package com.example.timesten.repository;
import com.example.timesten.model.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    Optional<Supervisor> findByUserId(Long userId);
}
