package hiddencore.ddasum.backend.security;

import java.io.Serializable;

/** JWT 인증 후 SecurityContext에 보관되는 주체 */
public record AuthenticatedUser(Long userId, String role, Long facilityId) implements Serializable {}
