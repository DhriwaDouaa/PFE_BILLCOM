package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COVOITURAGE_REQUESTS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CovoiturageRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "covoit_seq")
    @SequenceGenerator(name = "covoit_seq", sequenceName = "TIMESTEN.COVOIT_SEQ", allocationSize = 1)
    @Column(name = "REQUEST_ID")
    private Long requestId;

    @Column(name = "VEHICLE_ID")
    private Long vehicleId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "DISTANCE")
    private Double distance;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
