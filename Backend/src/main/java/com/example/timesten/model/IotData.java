package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "IOT_DATA", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class IotData {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "iot_seq")
    @SequenceGenerator(name = "iot_seq", sequenceName = "TIMESTEN.IOT_SEQ", allocationSize = 1)
    @Column(name = "IOT_ID")
    private Long iotId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "LONGITUDE")
    private Double longitude;

    @Column(name = "TEMPERATURE")
    private Double temperature;

    @Column(name = "HUMIDITY")
    private Double humidity;

    @Column(name = "BATTERY")
    private Integer battery;

    @Column(name = "SPEED")
    private Double speed;

    @Column(name = "CLIM_ACTIVE")
    private Integer climActive;

    @Column(name = "RADIO_ACTIVE")
    private Integer radioActive;

    @Column(name = "WIFI_ACTIVE")
    private Integer wifiActive;

    @Column(name = "OBSTACLE")
    private Integer obstacle;

    @Column(name = "MOTION")
    private Integer motion;

    @Column(name = "LOCKED")
    private Integer locked;

    @Column(name = "RECEIVED_AT")
    private LocalDateTime receivedAt;
}
