package hiddencore.ddasum.backend.web.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AssignPatientToBedRequest { // 병상에 환자 배정 요청 DTO
    private Long patientId;
}
