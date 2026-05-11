package com.example.timesten.controller;

import com.example.timesten.model.User;
import com.example.timesten.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmailAndPassword(email, password);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "role", user.getRole(),
                "userId", user.getUserId(),
                "username", user.getUsername(),
                "custId", user.getCustId() != null ? user.getCustId() : 0
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Email ou mot de passe incorrect"
            ));
        }
    }
}
