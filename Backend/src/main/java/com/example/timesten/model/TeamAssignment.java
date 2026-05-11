package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TEAM_ASSIGNMENTS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class TeamAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "assignment_seq")
    @SequenceGenerator(name = "assignment_seq", sequenceName = "TIMESTEN.ASSIGNMENT_SEQ", allocationSize = 1)
    @Column(name = "ASSIGNMENT_ID")
    private Long assignmentId;

    @Column(name = "SUPERVISOR_ID")
    private Long supervisorId;

    @Column(name = "AGENT_ID")
    private Long agentId;

    @Column(name = "CUST_ID")
    private Long custId;
}