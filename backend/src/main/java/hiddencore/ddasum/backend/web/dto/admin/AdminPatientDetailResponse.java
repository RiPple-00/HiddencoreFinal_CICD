package hiddencore.ddasum.backend.web.dto.admin;

import java.time.LocalDate;

import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.web.dto.PatientDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPatientDetailResponse {

    private Long patientId;
    private String name;
    private Patient.Gender gender;
    private Integer age;
    private LocalDate birthDate;
    private String address;
    private LocalDate admissionDate;
    private LocalDate dischargeDate;
    private Patient.BloodType bloodType;
    private String dietType;
    private String memo;
    private String building;
    private String room;
    private Patient.PatientStatus patientStatus;

    public static AdminPatientDetailResponse from(Patient patient) {
        PatientDto.DetailResponse d = PatientDto.DetailResponse.from(patient);
        return AdminPatientDetailResponse.builder()
                .patientId(d.getPatientId())
                .name(d.getName())
                .gender(d.getGender())
                .age(d.getAge())
                .birthDate(d.getBirthDate())
                .address(d.getAddress())
                .admissionDate(d.getAdmissionDate())
                .dischargeDate(d.getDischargeDate())
                .bloodType(d.getBloodType())
                .dietType(d.getDietType())
                .memo(d.getMemo())
                .building(d.getBuilding())
                .room(d.getRoom())
                .patientStatus(d.getPatientStatus())
                .build();
    }
}
