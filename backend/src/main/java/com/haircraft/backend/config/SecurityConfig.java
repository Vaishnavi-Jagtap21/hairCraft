package com.haircraft.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.haircraft.backend.utils.JwtAuthFilter;
import org.springframework.security.web.header.writers.CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ✅ Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ✅ Disable CSRF (JWT based app)
            .csrf(csrf -> csrf.disable())

            .headers(headers -> headers
                .frameOptions(frame -> frame.disable())
                .crossOriginOpenerPolicy(coop -> coop.policy(CrossOriginOpenerPolicy.UNSAFE_NONE))
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    System.err.println("Unauthorized access to " + request.getRequestURI() + ": " + authException.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized - Please login");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    System.err.println("Access Denied (403) to " + request.getRequestURI() + ": " + accessDeniedException.getMessage());
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
                })
            )

            .authorizeHttpRequests(auth -> auth

                // ================= ADMIN APIs =================
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // Public admin paths (Login and Create)
                .requestMatchers("/api/admin/login", "/api/admin/create").permitAll()
                
                // Protect all other admin endpoints requiring ROLE_ADMIN
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/offers/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/contact/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/users").hasRole("ADMIN")

                // Service & Stylist management (Admin only)
                .requestMatchers(HttpMethod.POST, "/api/services/**", "/api/stylists/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/services/**", "/api/stylists/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/services/**", "/api/stylists/**").hasRole("ADMIN")

                // ================= PUBLIC AUTH APIs =================
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/google/login").permitAll()
                .requestMatchers("/api/auth/reset-password/**", "/api/test-auth").permitAll()
                .requestMatchers("/api/auth/setup-admin").permitAll() 

                // ================= PUBLIC GET APIs =================
                .requestMatchers(HttpMethod.GET, "/api/services/**", "/api/offers/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/stylists/**", "/api/reviews").permitAll()
                .requestMatchers("/api/appointments/booked-slots").permitAll()

                // ================= USER APIs =================
                .requestMatchers("/api/reviews/add", "/api/appointments/book").authenticated()
                .requestMatchers("/api/appointments/user/**", "/api/appointments/history/user/**").authenticated()

                // ================= DEBUG =================
                .requestMatchers("/api/debug/**").permitAll()

                // ================= DEFAULT =================
                .anyRequest().authenticated()
            )

            // ✅ Stateless JWT session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authenticationProvider)

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // ================= CORS CONFIG =================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "https://haircraftt.vercel.app/")
        );

        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
