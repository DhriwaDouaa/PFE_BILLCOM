package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "SERVICES", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_seq")
    @SequenceGenerator(name = "service_seq", sequenceName = "TIMESTEN.SERVICE_SEQ", allocationSize = 1)
    @Column(name = "SERVICE_ID")
    private Long serviceId;

    @Column(name = "SERVICE_NAME", length = 100)
    private String serviceName;

    @Column(name = "SERVICE_TYPE", length = 50)
    private String serviceType;

    @Column(name = "BILLING_MODEL", length = 50)
    private String billingModel;

    @Column(name = "UNIT_PRICE", precision = 10, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "UNIT", length = 20)
    private String unit;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CODE_SERVICE", length = 20)
    private String codeService;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;
}