package hiddencore.ddasum.backend.web.dto.care;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianLinkedPatientResponse {

    private Long patientId;
    private String patientName;
    private String relationship;
    private Boolean primary;
}
