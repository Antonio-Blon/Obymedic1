package com.senati.obymedic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ObymedicApplication {

    public static void main(String[] args) {
        SpringApplication.run(ObymedicApplication.class, args);
    }
}
