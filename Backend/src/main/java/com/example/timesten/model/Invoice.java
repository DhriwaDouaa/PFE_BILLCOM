package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "INVOICES", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "invoice_seq")
    @SequenceGenerator(name = "invoice_seq", sequenceName = "TIMESTEN.INVOICE_SEQ", allocationSize = 1)
    @Column(name = "INVOICE_ID")
    private Long invoiceId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "PERIOD_START")
    private LocalDateTime periodStart;

    @Column(name = "PERIOD_END")
    private LocalDateTime periodEnd;

    @Column(name = "RAW_AMOUNT", precision = 10, scale = 4)
    private BigDecimal rawAmount;

    @Column(name = "DISCOUNT_AMOUNT", precision = 10, scale = 4)
    private BigDecimal discountAmount;

    @Column(name = "TAX_AMOUNT", precision = 10, scale = 4)
    private BigDecimal taxAmount;

    @Column(name = "TOTAL_AMOUNT", precision = 10, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
}
