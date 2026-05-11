package com.example.timesten.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SERVICE_REVIEWS", schema = "TIMESTEN")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class ServiceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq")
    @SequenceGenerator(name = "review_seq", sequenceName = "TIMESTEN.REVIEW_SEQ", allocationSize = 1)
    @Column(name = "REVIEW_ID")
    private Long reviewId;

    @Column(name = "SERVICE_ID")
    private Long serviceId;

    @Column(name = "CUST_ID")
    private Long custId;

    @Column(name = "RATING")
    private Integer rating;

    @Column(name = "COMMENT", length = 500)
    private String comment;

    @Column(name = "REVIEW_DATE")
    private LocalDateTime reviewDate;
}
