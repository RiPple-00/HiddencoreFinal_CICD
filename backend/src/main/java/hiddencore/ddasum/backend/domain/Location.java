package hiddencore.ddasum.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "LOCATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patientId;

    @Column(name = "building", length = 100)
    private String building;

    @Column(name = "floor")
    private Integer floor;

    @Column(name = "room", length = 50)
    private String room;

    @Column(name = "bed", length = 50)
    private Integer bed;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 50)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "roomgender_type", nullable = false, length = 50)
    private RoomGenderType roomGenderType; // -> 추가

    @Column(name = "room_capacity", nullable = false)
    private Integer roomCapacity; // 4인실인지 6인실인지 확인하는 용

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; 

    @Column(name = "is_occupied", nullable = false)
    private Boolean isOccupied; // 병동을 사용할 수 있는지 없는지

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (isOccupied == null) {
            isOccupied = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RoomType {

        GENERAL("일반실"),
        ICU("중환자실"),
        ISOLATION("격리실");

        private final String description;

        RoomType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum RoomGenderType {
        MALE,
        FEMALE,
        CONCOCTION
    }
}
