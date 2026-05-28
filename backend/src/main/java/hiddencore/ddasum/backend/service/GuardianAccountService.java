package hiddencore.ddasum.backend.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.domain.Users.UsersStatus;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.security.JwtService;

import java.util.List;
import hiddencore.ddasum.backend.web.dto.auth.GuardianLoginRequest;
import hiddencore.ddasum.backend.web.dto.auth.GuardianLoginResponse;
import hiddencore.ddasum.backend.web.dto.guardian.GuardianSignupRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianAccountService {

    private final MemberRepository memberRepository;
    private final GuardianPatientRepository guardianPatientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void signup(GuardianSignupRequest request) {
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }
        if (memberRepository.existsByPhone(request.getPhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 전화번호입니다.");
        }

        boolean agreed = Boolean.TRUE.equals(request.getEmailAgreed());
        Users user =
                Users.builder()
                        .facilityId(null)
                        .loginId(request.getLoginId())
                        .employeeLoginId(null)
                        .hireDate(null)
                        .password(passwordEncoder.encode(request.getPassword()))
                        .name(request.getName())
                        .phone(request.getPhone())
                        .email(request.getEmail())
                        .role(UsersRole.GUARDIAN)
                        .status(UsersStatus.ACTIVE)
                        .mustChangePassword(false)
                        .emailAgreed(agreed)
                        .emailAgreedAt(agreed ? LocalDateTime.now() : null)
                        .build();
        memberRepository.save(user);
    }

    public GuardianLoginResponse loginGuardian(GuardianLoginRequest request) {
        Users user =
                memberRepository
                        .findByLoginIdAndRole(request.getLoginId(), UsersRole.GUARDIAN)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        Long facilityPk = resolveGuardianFacilityId(user.getUserId());
        String token = jwtService.createAccessToken(user.getUserId(), user.getRole().name(), facilityPk);
        return GuardianLoginResponse.builder()
                .accessToken(token)
                .role(user.getRole())
                .facilityId(facilityPk)
                .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
                .build();
    }

    /** 연결된 환자 시설(주 보호자 우선) → 게시판·프로그램 API용 */
    private Long resolveGuardianFacilityId(Long guardianUserId) {
        List<GuardianPatient> links =
                guardianPatientRepository.findByGuardianUserId_UserIdOrderByIsPrimaryDesc(guardianUserId);
        for (GuardianPatient link : links) {
            Patient patient = link.getPatientId();
            if (patient != null && patient.getFacilityId() != null) {
                return patient.getFacilityId().getFacilityId();
            }
        }
        return null;
    }
}
