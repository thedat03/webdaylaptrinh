package com.example.webdaylaptrinh;

import com.example.webdaylaptrinh.config.VnPayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(VnPayProperties.class)
public class WebdaylaptrinhApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebdaylaptrinhApplication.class, args);
	}

}
