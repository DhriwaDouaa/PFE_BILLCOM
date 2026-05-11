package com.example.timesten.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerDTO {
    private Long custId;
    private String name;
    private String codeClient;
    private String clientType;
    private String status;
    private String phone;
    private Integer age;
    private BigDecimal balance;
    private String verificationStatus;
    private String verificationDoc;
}
