package hiddencore.ddasum.backend.web.dto;

import hiddencore.ddasum.backend.domain.Users.UsersRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class MemberDto {

    // ═══════════════════════════════════════════════════════════
    // 회원가입 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data  //getter, setter, toString, equals, hashCode 자동 생성
    //@Data는 lombok에서 제공하는 어노테이션
    @Builder //빌더 패턴이란? 객체 생성 시 가독성을 높이고, 선택적 매개변수를 지원하는 디자인 패턴
    @NoArgsConstructor
    @AllArgsConstructor   //DI 필드 자동주입
    public static class SignUpRequest {

        @NotBlank(message = "아이디는 필수입니다")
        @Size(min = 6, max = 100, message = "아이디는 6~100자여야 합니다")
        private String userId;

        @NotBlank(message = "사용자명은 필수입니다")
        @Size(min = 2, max = 50, message = "사용자명은 2~50자여야 합니다")
        private String username;

        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        @Size(max = 200, message = "이메일은 200자 이하여야 합니다")
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 6, max = 255, message = "비밀번호는 6~255자여야 합니다")
        private String password;

        @NotBlank(message = "전화번호는 필수입니다")
        @Size(max = 50, message = "전화번호는 50자 이하여야 합니다")
        private String phone;

        /** 마케팅·정보 이메일 수신 동의 (직원 발급 안내 메일과 별개) */
        private Boolean emailAgreed;
    }

    // ═══════════════════════════════════════════════════════════
    // 로그인 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {

        @NotBlank(message = "아이디는 필수입니다")
        private String userId;

        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }

    // ═══════════════════════════════════════════════════════════
    // 로그인 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {

        private String token; // JWT 토큰
        private Long id;
        private String userId;
        private String username;
        private String email;
        private String phone;
        private UsersRole role;
        /** 소속 시설 PK (식단 등 시설 단위 데이터와 매칭) */
        private Long facilityId;
        /** 최초 로그인 후 비밀번호 변경 필요 여부 */
        private boolean mustChangePassword;
    }

    // ═══════════════════════════════════════════════════════════
    // 회원 정보 응답 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberResponse {

        private Long id;
        private String userId;
        private String username;
        private String email;
        private String phone;
        private UsersRole role;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ═══════════════════════════════════════════════════════════
    // 회원 정보 수정 요청 DTO
    // ═══════════════════════════════════════════════════════════
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(min = 2, max = 50, message = "사용자명은 2~50자여야 합니다")
        private String username;

        @Email(message = "올바른 이메일 형식이 아닙니다")
        @Size(max = 200, message = "이메일은 200자 이하여야 합니다")
        private String email;

        @Size(max = 50, message = "전화번호는 50자 이하여야 합니다")
        private String phone;
    }
}