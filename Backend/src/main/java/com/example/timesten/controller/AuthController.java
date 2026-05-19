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
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        Long userId = Long.valueOf(body.get("userId"));
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Utilisateur non trouvé"));
        }
        User user = userOpt.get();
        if (!user.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(400).body(Map.of("message", "Mot de passe actuel incorrect"));
        }
        user.setPassword(newPassword);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "Mot de passe modifié avec succès"));
    }
}
