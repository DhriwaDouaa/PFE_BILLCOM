package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENTS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "TIMESTEN.PAYMENT_SEQ", allocationSize = 1)
    @Column(name = "PAYMENT_ID")
    private Long paymentId;

    @Column(name = "INVOICE_ID")
    private Long invoiceId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "AMOUNT", precision = 10, scale = 4)
    private BigDecimal amount;

    @Column(name = "PAYMENT_DATE")
    private LocalDateTime paymentDate;

    @Column(name = "PAYMENT_METHOD", length = 50)
    private String paymentMethod;

    @Column(name = "STATUS", length = 20)
    private String status;
}
