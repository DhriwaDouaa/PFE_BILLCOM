package com.example.timesten.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "VEHICLES", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class Vehicle {
    @Id
    @Column(name = "VEHICLE_ID")
    private Long vehicleId;
    @Column(name = "CUST_ID")
    private Long custId;
    @Column(name = "PLATE", length = 20)
    private String plate;
    @Column(name = "MODEL", length = 50)
    private String model;
    @Column(name = "STATUS", length = 20)
    private String status;
    @Column(name = "REGISTERED_AT")
    private LocalDateTime registeredAt;
    @Column(name = "LATITUDE")
    private Double latitude;
    @Column(name = "LONGITUDE")
    private Double longitude;
    @Column(name = "STATUT", length = 20)
    private String statut;
    @Column(name = "RATING")
    private Double rating;
    @Column(name = "TOTAL_TRIPS")
    private Integer totalTrips;
}
