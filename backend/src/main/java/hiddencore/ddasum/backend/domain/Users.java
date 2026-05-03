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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id")
    private Facility facilityId;

    @Column(name = "login_id", nullable = false, unique = true, length = 100)
    private String loginId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "phone", unique = true, nullable = false, length = 50)
    private String phone;

    @Column(name = "email", unique = true, nullable = false, length = 200)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "users_role", nullable = false, length = 30)
    private UsersRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "users_status", nullable = false)
    @Builder.Default
    private UsersStatus status = UsersStatus.ACTIVE;

    /** 직원 10자리 로그인 ID (보호자는 null) */
    @Column(name = "employee_login_id", length = 10)
    private String employeeLoginId;

    /** 직원 발급 시 입사일 (보호자는 null) */
    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "must_change_password", nullable = false)
    @Builder.Default
    private Boolean mustChangePassword = false;

    @Column(name = "email_agreed", nullable = false)
    @Builder.Default
    private Boolean emailAgreed = false;

    @Column(name = "email_agreed_at")
    private LocalDateTime emailAgreedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UsersRole {
        OFFICE,
        DOCTOR,
        CAREGIVER,
        GUARDIAN,
        /** 레거시·초기 시드 전용 (신규 발급 계정에는 사용하지 않음) */
        ADMIN
    }

    public enum UsersStatus {
        ACTIVE,
        INACTIVE,
        DELETED
    }
}
