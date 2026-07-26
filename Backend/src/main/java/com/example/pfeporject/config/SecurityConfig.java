package com.example.pfeporject.config;



import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import jakarta.servlet.DispatcherType;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Browser calls (Angular on :4200) with {@code Authorization: Bearer …} trigger a CORS preflight.
     * Without this, the client often sees HTTP status {@code 0} (network/CORS blocked).
     */
    @Bean
    public org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://localhost",           // Docker frontend (port 80)
                "http://localhost:80",
                "http://localhost:4200",      // Angular dev server
                "http://127.0.0.1:4200"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.CorsFilter> bean = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(new org.springframework.web.filter.CorsFilter(source));
        bean.setOrder(org.springframework.core.Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/google",
                                "/api/auth/verify",
                                "/api/auth/check-email",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/annonces", "/api/annonces/*", "/api/annonces/recherche", "/api/avis/annonce/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}