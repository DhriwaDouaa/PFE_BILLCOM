package com.example.timesten.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "SUPERVISORS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Supervisor {
    @Id
    @Column(name = "SUPERVISOR_ID")
    private Long supervisorId;
    @Column(name = "USER_ID")
    private Long userId;
    @Column(name = "DEPARTMENT", length = 100)
    private String department;
    @Column(name = "MAX_AGENTS")
    private Integer maxAgents;
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
