package com.example.timesten.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "AGENTS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Agent {
    @Id
    @Column(name = "AGENT_ID")
    private Long agentId;
    @Column(name = "USER_ID")
    private Long userId;
    @Column(name = "SUPERVISOR_ID")
    private Long supervisorId;
    @Column(name = "SPECIALITY", length = 100)
    private String speciality;
    @Column(name = "IS_ACTIVE")
    private Integer isActive;
    @Column(name = "HIRED_AT")
    private LocalDateTime hiredAt;
}
