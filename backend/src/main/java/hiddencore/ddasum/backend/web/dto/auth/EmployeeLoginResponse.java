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
public class EmployeeLoginResponse {

    private String accessToken;
    private UsersRole role;
    private boolean mustChangePassword;
}
