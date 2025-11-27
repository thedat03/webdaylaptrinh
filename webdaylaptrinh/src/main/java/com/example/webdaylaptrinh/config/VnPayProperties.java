package com.example.webdaylaptrinh.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "payment.vnpay")
public class VnPayProperties {
    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;
    private String ipnUrl;
    private String queryUrl;
    private String version;
    private String command;
    private String currCode;
    private String locale;
    private String orderType;
    private String frontendReturn;
    private long expireMinutes = 15;

    public long getExpireMinutes() {
        return expireMinutes;
    }
}

