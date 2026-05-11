package com.example.timesten.repository;

import com.example.timesten.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserLogRepository extends JpaRepository<UserLog, Long> {
    List<UserLog> findByUserId(Long userId);
    List<UserLog> findByRole(String role);
    List<UserLog> findByUsername(String username);
}
