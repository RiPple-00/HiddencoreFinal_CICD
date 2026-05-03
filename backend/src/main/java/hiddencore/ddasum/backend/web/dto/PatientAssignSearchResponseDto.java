package hiddencore.ddasum.backend.web.dto;

import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Patient;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.Period;

@Getter
@Builder
public class PatientAssignSearchResponseDto {
    private Long patientId;
    private String name;
    private String gender;
    private Integer age;
    /** 침상 표기 (예: 303-C). 미배정이면 null */
    private String assignedBedLabel;
    private String condition;
    private String chartId;
    /** 미배정 / 배정됨 */
    private String assignmentStatus;
    private boolean assignable;

    public static PatientAssignSearchResponseDto from(Patient patient) {
        Location location = patient.getLocationId();
        boolean unassigned = location == null;
        String assignedBedLabel = location != null ? location.getRoom() + "-" + location.getBed() : null;
        String assignmentStatus = unassigned ? "미배정" : "배정됨";

        return PatientAssignSearchResponseDto.builder()
                .patientId(patient.getPatientId())
                .name(patient.getName())
                .gender(patient.getGender() != null ? patient.getGender().name() : null)
                .age(getAge(patient.getBirthDate()))
                .assignedBedLabel(assignedBedLabel)
                .condition(patient.getStatus() != null ? patient.getStatus().getDescription() : "-")
                .chartId(String.valueOf(patient.getPatientId()))
                .assignmentStatus(assignmentStatus)
                .assignable(unassigned)
                .build();
    }

    private static Integer getAge(LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
