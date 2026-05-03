package hiddencore.ddasum.backend.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.web.dto.auth.ChangePasswordRequest;
import hiddencore.ddasum.backend.web.dto.auth.EmailConsentRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSelfService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(AuthenticatedUser current, ChangePasswordRequest request) {
        Users user = loadUser(current.userId());
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
    }

    @Transactional
    public void updateEmailConsent(AuthenticatedUser current, EmailConsentRequest request) {
        Users user = loadUser(current.userId());
        boolean agreed = Boolean.TRUE.equals(request.getEmailAgreed());
        user.setEmailAgreed(agreed);
        user.setEmailAgreedAt(agreed ? LocalDateTime.now() : null);
    }

    private Users loadUser(Long userId) {
        return memberRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }
}
