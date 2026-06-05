package hiddencore.ddasum.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.gallery")
public class GalleryDemoProperties {

    /** InsightFace DB 키 patient_6 → 시연 보호자 연동 환자(기만경) */
    public static final String AI_PATIENT_KEY = "patient_6";

    private static final Map<String, String> AI_PATIENT_DISPLAY_NAMES =
            Map.of(
                    "patient_1", "나채영",
                    "patient_2", "김영희",
                    "patient_3", "강나연",
                    "patient_4", "김태우",
                    "patient_5", "장원준",
                    "patient_6", "기만경");

    public static String displayNameForAiPatient(String aiPatientKey) {
        if (aiPatientKey == null || aiPatientKey.isBlank()) {
            return "";
        }
        return AI_PATIENT_DISPLAY_NAMES.getOrDefault(aiPatientKey, aiPatientKey);
    }

    public static List<String> displayNamesForAiPatients(List<String> aiPatientKeys) {
        if (aiPatientKeys == null || aiPatientKeys.isEmpty()) {
            return List.of();
        }
        return aiPatientKeys.stream()
                .map(GalleryDemoProperties::displayNameForAiPatient)
                .collect(Collectors.toList());
    }

    public static Map<String, String> aiPatientDisplayNames() {
        return new LinkedHashMap<>(AI_PATIENT_DISPLAY_NAMES);
    }

    /** 비우면 260401008(기만경, 107호) 사용 */
    private Long demoPatientId = 260401008L;

    private String aiServerBaseUrl = "http://127.0.0.1:8000";

    private String uploadDir = "uploads";

    /** HTTP AI 실패 시 로컬 python 분류 스크립트 경로 기준 */
    private String aiServerHome = "../ai/ai-server";

    /** 팀원 얼굴 인식(dasum-face-ai-test) 프로젝트 경로 */
    private String faceAiHome = "../ai/dasum-face-ai-test";

    private String pythonExecutable = "python";

    public Path resolveAiServerHome() {
        return Paths.get(aiServerHome).toAbsolutePath().normalize();
    }

    public Path resolveFaceAiHome() {
        return Paths.get(faceAiHome).toAbsolutePath().normalize();
    }
}
