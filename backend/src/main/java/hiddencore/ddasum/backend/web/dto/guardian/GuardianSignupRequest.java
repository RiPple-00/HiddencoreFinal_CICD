package hiddencore.ddasum.backend.web.dto.guardian;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianSignupRequest {

    @NotBlank
    @Size(min = 4, max = 100)
    private String loginId;

    @NotBlank
    @Size(min = 4, max = 200)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String phone;

    @NotBlank
    @Email
    @Size(max = 200)
    private String email;

    @NotNull
    private Boolean emailAgreed;
}
