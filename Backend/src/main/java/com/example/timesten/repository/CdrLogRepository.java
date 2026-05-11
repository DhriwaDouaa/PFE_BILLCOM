package com.example.timesten.repository;

import com.example.timesten.model.CdrLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CdrLogRepository extends JpaRepository<CdrLog, Long> {
    List<CdrLog> findByCustId(Long custId);
    List<CdrLog> findByStatus(String status);
}
