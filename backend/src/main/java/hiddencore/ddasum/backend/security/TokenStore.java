package hiddencore.ddasum.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis-backed whitelist of currently valid access tokens.
 *
 * <p>A token is accepted only while its entry exists in Redis. Each entry expires together with the
 * JWT itself, and logout deletes it so the token is rejected on the very next request.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenStore {

    private static final String KEY_PREFIX = "auth:token:";

    private final StringRedisTemplate redisTemplate;
    private final JwtService jwtService;

    /** Register a freshly issued token, expiring it from Redis when the JWT itself expires. */
    public void store(String token) {
        Claims claims = jwtService.parseClaims(token);
        long ttlMs = claims.getExpiration().getTime() - System.currentTimeMillis();
        if (ttlMs <= 0) {
            return;
        }
        redisTemplate.opsForValue().set(key(token), claims.getSubject(), Duration.ofMillis(ttlMs));
    }

    /**
     * True while the token is still whitelisted (issued and neither revoked nor expired). Fails
     * closed: if Redis is unreachable the token is treated as invalid rather than trusted.
     */
    public boolean isValid(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key(token)));
        } catch (RuntimeException e) {
            log.warn("[TokenStore] Redis lookup failed; rejecting token", e);
            return false;
        }
    }

    /** Revoke a token (logout) so it is rejected on the next request. */
    public void revoke(String token) {
        redisTemplate.delete(key(token));
    }

    private static String key(String token) {
        return KEY_PREFIX + sha256Hex(token);
    }

    private static String sha256Hex(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
