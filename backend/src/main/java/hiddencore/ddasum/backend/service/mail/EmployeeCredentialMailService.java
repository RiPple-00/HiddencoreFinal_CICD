package hiddencore.ddasum.backend.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * 직원 계정 발급 안내는 서비스 필수 안내 메일로, 마케팅 수신 동의와 무관하게 발송한다.
 */
@Service
@RequiredArgsConstructor
public class EmployeeCredentialMailService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeCredentialMailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.log-only:true}")
    private boolean logOnly;

    public void sendEmployeeCredentials(
            String toEmail, String recipientName, String facilityCode, String employeeLoginId, String tempPasswordPlain) {
        String body =
                String.format(
                        "안녕하세요 %s님,%n%n요양병원 통합시스템 직원 계정이 발급되었습니다.%n%n"
                                + "로그인 정보%n- 시설코드: %s%n- 직원 ID: %s%n- 임시 비밀번호: %s%n%n"
                                + "최초 로그인 후 비밀번호 변경이 필요합니다.%n",
                        recipientName, facilityCode, employeeLoginId, tempPasswordPlain);
        if (logOnly) {
            log.info(
                    "[직원 계정 발급 — 서비스 안내 메일] to={} subject=직원 계정 발급\n{}",
                    toEmail,
                    body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[요양병원 통합시스템] 직원 계정이 발급되었습니다");
        message.setText(body);
        try {
            mailSender.send(message);
        } catch (MailException e) {
            log.warn("SMTP 발송 실패, 로그로 대체합니다: {}", e.getMessage());
            log.info("[직원 계정 발급 — 서비스 안내 메일 폴백]\n{}", body);
        }
    }
}
