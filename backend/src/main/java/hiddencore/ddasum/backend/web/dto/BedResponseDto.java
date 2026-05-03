package hiddencore.ddasum.backend.web.dto;

import java.time.LocalDate;
import java.time.Period;

import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Patient;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BedResponseDto {

    private Long locationId;
    private Long patientId;
    private String bedId;
    private Boolean occupied; // (사용/ 사용안함)
    private String status;
    private String name;
    private String gender;
    private Integer age;
    private String type;
    private LocalDate admissionDate;
    private Integer roomCapacity; // (4인실/6인실)
    private LocalDate birthDate;

    /**
     * @param patient 환자 정보. LOCATION.patient_id 또는 PATIENT.location_id 어느 쪽으로만 연결돼 있어도
     *            서비스에서 한쪽으로 보강해 넘긴다.
     */
    public static BedResponseDto from(Location location, Patient patient) {

        return BedResponseDto.builder()
                .locationId(location.getLocationId())
                .patientId(patient != null ? patient.getPatientId() : null)
                .bedId(location.getRoom() + "-" + String.valueOf(location.getBed()))
                .occupied(patient != null)
                .status(patient != null
                        ? (patient.getStatus() != null ? patient.getStatus().getDescription() : "-")
                        : "비어있음")
                .name(patient != null ? patient.getName() : null)
                .gender(patient != null && patient.getGender() != null ? patient.getGender().name() : null)
                .age(patient != null && patient.getBirthDate() != null
                        ? Period.between(patient.getBirthDate(), LocalDate.now()).getYears()
                        : null)
                .birthDate(patient != null ? patient.getBirthDate() : null)
                .type(patient != null && patient.getType() != null ? patient.getType().getDescription() : null)
                .admissionDate(patient != null ? patient.getAdmissionDate() : null)
                .roomCapacity(location.getRoomCapacity())
                .build();
    }
}