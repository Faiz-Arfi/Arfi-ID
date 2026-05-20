package dev.faizarfi.auth.service;

import dev.faizarfi.auth.exception.JWTExpiredException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class ChildProjectJwtService {

    String secretKey;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // Generate Access Token (Short Lived)
    public String generateAccessToken(String username, String clientId, String role, String secret) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("client_id", clientId);
        claims.put("role", role);
        this.secretKey = secret;
        return buildToken(claims, username, accessExpiration);
    }

    // Generate Refresh Token (Long Lived)
    public String generateRefreshToken(String username, String clientId, String secret) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("client_id", clientId);
        this.secretKey = secret;
        return buildToken(claims, username, refreshExpiration);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // Extract Username (Email) for JWT Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject) // Ideally use User ID here later, but Email is OK for now
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        if (claims == null) throw new JWTExpiredException("Access token expired. Use refresh token to get a new one.");
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        // try catch to detect expired tokens
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }
        catch (ExpiredJwtException e) {
            // return null if token is expired
            return null;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

//    @Value("${jwt.access-expiration}")
//    private long accessExpiration;
//
//    @Value("${jwt.refresh-expiration}")
//    private long refreshExpiration;
//
//    // Generate Access Token (Short Lived)
//    public String generateAccessToken(String username, String clientId, String role, String secretKey) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("client_id", clientId);
//        claims.put("role", role);
//        return buildToken(claims, username, accessExpiration, secretKey);
//    }
//
//    // Generate Refresh Token (Long Lived)
//    public String generateRefreshToken(String username, String clientId, String secretKey) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("client_id", clientId);
//        return buildToken(claims, username, refreshExpiration, secretKey);
//    }
//
//    // Extract Username (Email) for JWT Token
//    public String extractUsername(String token, String secretKey) {
//        return extractClaim(token, Claims::getSubject, secretKey);
//    }
//
////    public boolean isTokenValid(String token, UserDetails userDetails, String secretKey) {
////        final String username = extractUsername(token, secretKey);
////        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token, secretKey);
////    }
//
//    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration, String secretKey) {
//        return Jwts.builder()
//                .setClaims(extraClaims)
//                .setSubject(subject) // Ideally use User ID here later, but Email is OK for now
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + expiration))
//                .signWith(getSignInKey(secretKey), SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    private Key getSignInKey(String secretKey) {
//        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
//        return Keys.hmacShaKeyFor(keyBytes);
//    }
//
//    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver, String secretKey) {
//        final Claims claims = extractAllClaims(token, secretKey);
//        if (claims == null) throw new JWTExpiredException("Access token expired. Use refresh token to get a new one.");
//        return claimsResolver.apply(claims);
//    }
//
//    private Claims extractAllClaims(String token, String secretKey) {
//        // try catch to detect expired tokens
//        try {
//            return Jwts.parserBuilder()
//                    .setSigningKey(getSignInKey(secretKey))
//                    .build()
//                    .parseClaimsJws(token)
//                    .getBody();
//        }
//        catch (ExpiredJwtException e) {
//            // return null if token is expired
//            return null;
//        }
//    }

//    private boolean isTokenExpired(String token, String secretKey) {
//        return extractExpiration(token, secretKey).before(new Date());
//    }

//    private Date extractExpiration(String token, String secretKey) {
//        return extractClaim(token, Claims::getExpiration, secretKey);
//    }
}