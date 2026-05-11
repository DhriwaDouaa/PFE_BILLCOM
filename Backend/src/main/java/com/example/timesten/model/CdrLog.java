package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CDR_LOGS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class CdrLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cdr_seq")
    @SequenceGenerator(name = "cdr_seq", sequenceName = "TIMESTEN.CDR_SEQ", allocationSize = 1)
    @Column(name = "CDR_ID")
    private Long cdrId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "SERVICE_ID")
    private Long serviceId;

    @Column(name = "SESSION_START")
    private LocalDateTime sessionStart;

    @Column(name = "SESSION_END")
    private LocalDateTime sessionEnd;

    @Column(name = "DURATION_MIN", precision = 10, scale = 2)
    private BigDecimal durationMin;

    @Column(name = "DISTANCE_KM", precision = 10, scale = 3)
    private BigDecimal distanceKm;

    @Column(name = "WIFI_MB", precision = 10, scale = 3)
    private BigDecimal wifiMb;

    @Column(name = "PASSENGERS_COUNT")
    private Integer passengersCount;

    @Column(name = "OPTIONS_ACTIVATED", length = 255)
    private String optionsActivated;

    @Column(name = "RFID_TAG", length = 100)
    private String rfidTag;

    @Column(name = "ECO_DRIVING")
    private Integer ecoDriving;

    @Column(name = "RAW_AMOUNT", precision = 10, scale = 4)
    private BigDecimal rawAmount;

    @Column(name = "STATUS", length = 20)
    private String status;
}