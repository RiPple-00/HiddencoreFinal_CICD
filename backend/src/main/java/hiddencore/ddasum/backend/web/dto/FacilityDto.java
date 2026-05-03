package hiddencore.ddasum.backend.web.dto;

import hiddencore.ddasum.backend.domain.Facility;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FacilityDto {

    private Long facilityId;
    private String name;
    private String address;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FacilityDto from(Facility facility) {
        return FacilityDto.builder()
                .facilityId(facility.getFacilityId())
                .name(facility.getName())
                .address(facility.getAddress())
                .phone(facility.getPhone())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
}