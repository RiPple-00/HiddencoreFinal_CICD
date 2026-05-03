package hiddencore.ddasum.backend.web.dto.auth;

import hiddencore.ddasum.backend.domain.Users.UsersRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianLoginResponse {

    private String accessToken;
    private UsersRole role;
    /** 보호자는 직접 가입으로 기본 false */
    private boolean mustChangePassword;
}
