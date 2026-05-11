package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "USER_LOGS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_log_seq")
    @SequenceGenerator(name = "user_log_seq", sequenceName = "TIMESTEN.USER_LOG_SEQ", allocationSize = 1)
    @Column(name = "LOG_ID")
    private Long logId;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "USERNAME", length = 50)
    private String username;

    @Column(name = "ROLE", length = 20)
    private String role;

    @Column(name = "ACTION", length = 50)
    private String action;

    @Column(name = "LOG_DATE")
    private LocalDateTime logDate;

    @Column(name = "IP_ADDRESS", length = 50)
    private String ipAddress;
}