package com.haircraft.backend.utils;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String uri = request.getRequestURI();
        
        // Skip logging for OPTIONS requests (noisy)
        if (!"OPTIONS".equals(request.getMethod())) {
            System.out.println("JwtAuthFilter: Processing " + request.getMethod() + " " + uri);
        }

        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            // Only log missing token for protected routes to avoid spamming for public ones
            if (uri.startsWith("/api/admin") && !uri.endsWith("/login") && !uri.endsWith("/create")) {
                System.out.println("JwtAuthFilter: MISSING Bearer token for protected URI: " + uri);
            }
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String username;

        try {
            username = jwtUtil.extractUsername(jwt);
            System.out.println("JwtAuthFilter: Extracted user: " + username);
        } catch (Exception e) {
            System.err.println("JwtAuthFilter: Failed to extract username: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(username);

                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    System.out.println("JwtAuthFilter: User '" + username + "' validated. Roles: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                } else {
                    System.err.println("JwtAuthFilter: Token is INVALID for user '" + username + "'");
                }
            } catch (Exception e) {
                System.err.println("JwtAuthFilter: Authentication failed for '" + username + "': " + e.getMessage());
                // If user not found, 401 will be triggered by SecurityConfig
            }
        } else if (username != null) {
            System.out.println("JwtAuthFilter: User '" + username + "' already authenticated");
        }

        filterChain.doFilter(request, response);
    }
}
