package hiddencore.ddasum.backend.web;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


// DB 제약 위반 등 원인 파악을 위해 상세 메시지를 로그·응답에 남김

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Throwable root = ex.getMostSpecificCause();
        String detail = root != null ? root.getMessage() : ex.getMessage();
        log.warn("DataIntegrityViolation: {}", detail, ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "DATA_INTEGRITY",
                "message", "DB 저장 규칙 위반입니다. 시설·회원 FK와 컬럼을 확인하세요.",
                "detail", detail != null ? detail : ""));
    }
}
