package com.haircraft.backend.utils;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.haircraft.backend.Entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // 🔐 Base64-encoded secret (32+ chars when decoded)
    private static final String SECRET =
            "aGFpcmNyYWZ0X3NlY3JldF9rZXlfMzJfY2hhcmFjdGVycw==";

    // ================= SIGNING KEY =================
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ================= GENERATE TOKEN =================
    
   public String generateToken(User user) {
    return Jwts.builder()
            .setSubject(user.getEmail().toLowerCase())
           .claim("role", user.getRole())

// ✅ only ADMIN or USER
            .setIssuedAt(new Date())
            .setExpiration(
                new Date(System.currentTimeMillis() + 604800000)
            )
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
}






    // ================= EXTRACT USERNAME =================
    public String extractUsername(String token) {
        String sub = extractClaim(token, Claims::getSubject);
        return sub != null ? sub.toLowerCase() : null;
    }

    // ================= VALIDATE TOKEN =================
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equalsIgnoreCase(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    // ================= HELPERS =================
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
