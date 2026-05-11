package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "USERS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "TIMESTEN.USER_SEQ", allocationSize = 1)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "PIN", length = 6)
    private String pin;

    @Column(name = "ROLE", length = 20)
    private String role;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "USERNAME", length = 50)
    private String username;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "PASSWORD", length = 100)
    private String password;
}