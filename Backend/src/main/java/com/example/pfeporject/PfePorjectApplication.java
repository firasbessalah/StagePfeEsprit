package com.example.pfeporject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PfePorjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(PfePorjectApplication.class, args);
    }

}
