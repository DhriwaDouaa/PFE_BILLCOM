package com.example.timesten.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class CaptchaController {

    @Value("${hcaptcha.secret}")
    private String hcaptchaSecret;

    private static final String HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

    @PostMapping("/verify-captcha")
    public ResponseEntity<Map<String, Object>> verifyCaptcha(@RequestBody Map<String, String> body) {
        String token = body.get("token");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Token manquant"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", hcaptchaSecret);
            params.add("response", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(HCAPTCHA_VERIFY_URL, request, Map.class);
            Map<String, Object> result = response.getBody();
            boolean success = result != null && Boolean.TRUE.equals(result.get("success"));

            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", true, "fallback", true));
        }
    }
}
