package hiddencore.ddasum.backend.web.dto.admin;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEmployeeCreateRequest {

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

    @NotBlank
    @Pattern(regexp = "OFFICE|DOCTOR|CAREGIVER")
    private String role;

    @NotNull
    private LocalDate hireDate;

    @NotNull
    private Boolean emailAgreed;
}
