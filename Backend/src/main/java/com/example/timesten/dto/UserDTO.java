package com.example.timesten.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Long custId;
    // PIN et PASSWORD non inclus → sécurité !
}