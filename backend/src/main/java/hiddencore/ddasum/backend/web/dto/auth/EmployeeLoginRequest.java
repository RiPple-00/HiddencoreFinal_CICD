package hiddencore.ddasum.backend.web.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLoginRequest {

    @NotBlank
    @Size(min = 8, max = 8)
    private String facilityCode;

    @NotBlank
    @Size(min = 10, max = 10)
    private String employeeLoginId;

    @NotBlank
    private String password;
}
