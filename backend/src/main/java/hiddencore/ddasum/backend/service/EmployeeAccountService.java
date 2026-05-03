package hiddencore.ddasum.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.domain.Users.UsersStatus;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.security.JwtService;
import hiddencore.ddasum.backend.security.StaffLoginIdCodec;
import hiddencore.ddasum.backend.service.mail.EmployeeCredentialMailService;
import hiddencore.ddasum.backend.web.dto.admin.AdminEmployeeCreateRequest;
import hiddencore.ddasum.backend.web.dto.admin.EmployeeIssueResponse;
import hiddencore.ddasum.backend.web.dto.auth.EmployeeLoginRequest;
import hiddencore.ddasum.backend.web.dto.auth.EmployeeLoginResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeAccountService {

    private static final DateTimeFormatter YYMMDD = DateTimeFormatter.ofPattern("yyMMdd");

    private final MemberRepository memberRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmployeeCredentialMailService employeeCredentialMailService;

    @Transactional
    public EmployeeIssueResponse issueEmployee(AdminEmployeeCreateRequest request, Users issuer) {
        if (issuer.getFacilityId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "소속 시설이 없는 계정은 직원을 발급할 수 없습니다.");
        }
        UsersRole issuerRole = issuer.getRole();
        if (issuerRole != UsersRole.OFFICE && issuerRole != UsersRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "직원 계정 발급 권한이 없습니다.");
        }

        Facility facility = issuer.getFacilityId();
        String facilityCode = facility.getFacilityCode();
        if (facilityCode == null || facilityCode.length() != 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "시설에 8자리 시설코드가 등록되어 있지 않습니다. 관리자에게 문의하세요.");
        }

        UsersRole targetRole = parseStaffRole(request.getRole());
        String jobPrefix = jobCodePrefix(targetRole);
        String yyMmDd = request.getHireDate().format(YYMMDD);
        String idPrefix = jobPrefix + yyMmDd;

        int lastSeq = memberRepository.findMaxEmployeeSequenceSuffix(facility.getFacilityId(), idPrefix);
        int nextSeq = lastSeq + 1;
        if (nextSeq > 99) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "당일 동일 직군·입사일 계정 발급 한도(99)를 초과했습니다.");
        }
        String employeeLoginId = idPrefix + String.format("%02d", nextSeq);

        String tempPassword = lastFourDigitsOfPhone(request.getPhone());
        String encoded = passwordEncoder.encode(tempPassword);
        String internalLoginId = StaffLoginIdCodec.encode(facilityCode, employeeLoginId);

        if (memberRepository.existsByLoginId(internalLoginId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 직원 로그인 ID입니다.");
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByPhone(request.getPhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 전화번호입니다.");
        }

        boolean agreed = Boolean.TRUE.equals(request.getEmailAgreed());
        Users created =
                Users.builder()
                        .facilityId(facility)
                        .loginId(internalLoginId)
                        .employeeLoginId(employeeLoginId)
                        .hireDate(request.getHireDate())
                        .password(encoded)
                        .name(request.getName())
                        .phone(request.getPhone())
                        .email(request.getEmail())
                        .role(targetRole)
                        .status(UsersStatus.ACTIVE)
                        .mustChangePassword(true)
                        .emailAgreed(agreed)
                        .emailAgreedAt(agreed ? LocalDateTime.now() : null)
                        .build();

        memberRepository.save(created);

        try {
            employeeCredentialMailService.sendEmployeeCredentials(
                    request.getEmail(), request.getName(), facilityCode, employeeLoginId, tempPassword);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(EmployeeAccountService.class)
                    .warn("직원 안내 메일 처리 중 오류(계정은 생성됨): {}", e.getMessage());
        }

        return EmployeeIssueResponse.builder()
                .message("직원 계정이 발급되었고 이메일로 전송되었습니다.")
                .build();
    }

    public EmployeeLoginResponse loginEmployee(EmployeeLoginRequest request) {
        Facility facility =
                facilityRepository
                        .findByFacilityCode(request.getFacilityCode())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "시설코드 또는 직원 정보가 올바르지 않습니다."));

        Users user =
                memberRepository
                        .findByFacilityId_FacilityIdAndEmployeeLoginId(
                                facility.getFacilityId(), request.getEmployeeLoginId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "시설코드 또는 직원 정보가 올바르지 않습니다."));

        if (!isStaffRole(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "시설코드 또는 직원 정보가 올바르지 않습니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "시설코드 또는 직원 정보가 올바르지 않습니다.");
        }

        Long facilityPk = user.getFacilityId() != null ? user.getFacilityId().getFacilityId() : null;
        String token = jwtService.createAccessToken(user.getUserId(), user.getRole().name(), facilityPk);
        return EmployeeLoginResponse.builder()
                .accessToken(token)
                .role(user.getRole())
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .build();
    }

    private static boolean isStaffRole(UsersRole role) {
        return role == UsersRole.OFFICE || role == UsersRole.DOCTOR || role == UsersRole.CAREGIVER || role == UsersRole.ADMIN;
    }

    private static UsersRole parseStaffRole(String role) {
        return switch (role) {
            case "OFFICE" -> UsersRole.OFFICE;
            case "DOCTOR" -> UsersRole.DOCTOR;
            case "CAREGIVER" -> UsersRole.CAREGIVER;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 직군입니다.");
        };
    }

    private static String jobCodePrefix(UsersRole role) {
        return switch (role) {
            case OFFICE -> "11";
            case DOCTOR -> "21";
            case CAREGIVER -> "31";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 직군입니다.");
        };
    }

    private static String lastFourDigitsOfPhone(String phone) {
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "전화번호에서 임시 비밀번호를 만들 수 없습니다. 숫자 4자리 이상이 필요합니다.");
        }
        return digits.substring(digits.length() - 4);
    }
}
