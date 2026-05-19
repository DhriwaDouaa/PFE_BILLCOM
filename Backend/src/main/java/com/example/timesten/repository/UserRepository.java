package com.example.timesten.repository;

import com.example.timesten.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPin(String pin);

    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email); // unique email check

    Optional<User> findByUsername(String username); // unique name check

    List<User> findAll();
}