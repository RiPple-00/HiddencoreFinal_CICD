package hiddencore.ddasum.backend.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import hiddencore.ddasum.backend.domain.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PatientDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private Long patientId;
        private String name;
        private Patient.Gender gender;
        private Integer age;
        private String building;
        private String room;
        private LocalDate birthDate;
        private Long locationId;
        private Patient.PatientStatus patientStatus;

        private Long primaryCaregiverUserId;
        private String primaryCaregiverName;

        public static ListResponse from(Patient patient) {
            return ListResponse.builder()
                    .patientId(patient.getPatientId())
                    .name(patient.getName())
                    .gender(patient.getGender())
                    .age(calculateAge(patient.getBirthDate()))
                    .birthDate(patient.getBirthDate())
                    .building(patient.getLocationId() != null ? patient.getLocationId().getBuilding() : null)
                    .room(patient.getLocationId() != null ? patient.getLocationId().getRoom() : null)
                    .patientStatus(patient.getStatus())
                    .locationId(patient.getLocationId() != null ? patient.getLocationId().getLocationId() : null)
                    .primaryCaregiverUserId(
                            patient.getPrimaryCaregiver() != null
                                    ? patient.getPrimaryCaregiver().getUserId()
                                    : null)
                    .primaryCaregiverName(
                            patient.getPrimaryCaregiver() != null
                                    ? patient.getPrimaryCaregiver().getName()
                                    : null)
                    .build();
        }

        private static Integer calculateAge(LocalDate birthDate) {
            if (birthDate == null)
                return null;
            return Period.between(birthDate, LocalDate.now()).getYears();
        }

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailResponse {
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

        private Long primaryCaregiverUserId;
        private String primaryCaregiverName;

        public static DetailResponse from(Patient patient) {
            return DetailResponse.builder()
                    .patientId(patient.getPatientId())
                    .name(patient.getName())
                    .gender(patient.getGender())
                    .age(calculateAge(patient.getBirthDate()))
                    .birthDate(patient.getBirthDate())
                    .address(patient.getAddress())
                    .admissionDate(patient.getAdmissionDate())
                    .dischargeDate(patient.getDischargeDate())
                    .bloodType(patient.getType())
                    .dietType(patient.getDietType())
                    .memo(patient.getMemo())
                    .building(patient.getLocationId() != null ? patient.getLocationId().getBuilding() : null)
                    .room(patient.getLocationId() != null ? patient.getLocationId().getRoom() : null)
                    .patientStatus(patient.getStatus())
                    .primaryCaregiverUserId(
                            patient.getPrimaryCaregiver() != null
                                    ? patient.getPrimaryCaregiver().getUserId()
                                    : null)
                    .primaryCaregiverName(
                            patient.getPrimaryCaregiver() != null
                                    ? patient.getPrimaryCaregiver().getName()
                                    : null)
                    .build();
        }

        private static Integer calculateAge(LocalDate birthDate) {
            if (birthDate == null) {
                return null;
            }
            return Period.between(birthDate, LocalDate.now()).getYears();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String name;

        @JsonDeserialize(using = GenderJsonDeserializer.class)
        private Patient.Gender gender;

        private LocalDate birthDate;
        private String address;
        private LocalDate admissionDate;
        private Patient.BloodType bloodType;
        private String building;
        private String room;
        private Integer bed;
        private String memo;
        private Long locationId;

        private Long primaryCaregiverUserId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;

        @JsonDeserialize(using = GenderJsonDeserializer.class)
        private Patient.Gender gender;

        private LocalDate birthDate;
        private LocalDate admissionDate;
        private LocalDate dischargeDate;
        private Patient.BloodType bloodType;
        private BigDecimal height;
        private BigDecimal weight;
        private String admissionStatus;
        private String dietType;
        private String memo;
        private Patient.PatientStatus patientStatus;
        private Long facilityId;

        private Long primaryCaregiverUserId;
    }

}