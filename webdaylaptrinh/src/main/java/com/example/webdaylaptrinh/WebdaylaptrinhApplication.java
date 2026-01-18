package com.example.webdaylaptrinh;

import com.example.webdaylaptrinh.config.VnPayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(VnPayProperties.class)
@EnableScheduling
public class WebdaylaptrinhApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebdaylaptrinhApplication.class, args);
	}

}
