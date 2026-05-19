package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "CUSTOMERS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Customer {

    @Id
    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "NAME", length = 100)
    private String name;

    @Column(name = "BALANCE", precision = 10, scale = 3)
    private BigDecimal balance;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "CLIENT_TYPE", length = 20)
    private String clientType;

    @Column(name = "AGE")
    private Integer age;
    
    @Column(name = "CODE_CLIENT", length = 20)
    private String codeClient;
    @Column(name = "VERIFICATION_STATUS", length = 20)
    private String verificationStatus;

    @Column(name = "VERIFICATION_DOC", length = 500)
    private String verificationDoc;
    @Column(name = "PROFILE_PICTURE", length = 10000)
    private String profilePicture;

    @Column(name = "AGENT_ID")
    private Long agentId;
}
