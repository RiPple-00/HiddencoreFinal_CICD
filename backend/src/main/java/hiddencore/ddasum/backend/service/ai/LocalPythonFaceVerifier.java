package hiddencore.ddasum.backend.service.ai;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalPythonFaceVerifier {

    public static final int PROCESS_TIMEOUT_SEC = 120;

    private final GalleryDemoProperties galleryDemoProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record FaceVerifyResult(
            boolean accepted,
            String reason,
            String message,
            String targetPatient,
            String targetPatientName,
            int facesDetected,
            List<String> detectedPatients,
            List<String> detectedPatientNames) {}

    public Optional<FaceVerifyResult> verify(String absoluteImagePath, String targetPatientKey) {
        Path faceAiHome = galleryDemoProperties.resolveFaceAiHome();
        Path script = faceAiHome.resolve("scripts").resolve("verify_patient_in_image.py");
        if (!script.toFile().isFile()) {
            log.warn("Face verify script not found: {}", script);
            return Optional.empty();
        }

        ProcessBuilder builder =
                new ProcessBuilder(
                        galleryDemoProperties.getPythonExecutable(),
                        script.toString(),
                        Path.of(absoluteImagePath).toAbsolutePath().toString(),
                        targetPatientKey);
        builder.directory(faceAiHome.toFile());
        builder.redirectErrorStream(true);
        builder.environment().put("PYTHONIOENCODING", "utf-8");
        builder.environment().put("PYTHONUTF8", "1");

        try {
            Process process = builder.start();
            boolean finished = process.waitFor(PROCESS_TIMEOUT_SEC, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("Face verify timed out");
                return Optional.empty();
            }

            String output;
            try (BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().reduce((a, b) -> b).orElse("");
            }

            if (process.exitValue() != 0) {
                log.warn("Face verify failed (exit {}): {}", process.exitValue(), output);
                return Optional.empty();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = objectMapper.readValue(output, Map.class);
            if (body.containsKey("error")) {
                log.warn("Face verify error: {}", body.get("error"));
                return Optional.empty();
            }

            List<String> detectedPatients = stringListVal(body.get("detected_patients"));
            List<String> detectedPatientNames =
                    GalleryDemoProperties.displayNamesForAiPatients(detectedPatients);
            boolean accepted = Boolean.TRUE.equals(body.get("accepted"));
            String targetPatient = stringVal(body.get("target_patient"));

            return Optional.of(
                    new FaceVerifyResult(
                            accepted,
                            stringVal(body.get("reason")),
                            buildFaceVerifyMessage(accepted, detectedPatientNames),
                            targetPatient,
                            GalleryDemoProperties.displayNameForAiPatient(targetPatient),
                            numberVal(body.get("faces_detected")).intValue(),
                            detectedPatients,
                            detectedPatientNames));
        } catch (Exception ex) {
            log.warn("Face verify exception: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static String buildFaceVerifyMessage(boolean accepted, List<String> detectedPatientNames) {
        if (detectedPatientNames.isEmpty()) {
            return "담당 환자가 인식되지 않았습니다. 담당 환자를 포함한 사진을 올려 주세요.";
        }
        String listed = String.join(", ", detectedPatientNames);
        if (accepted) {
            return "인식된 환자: "
                    + listed
                    + ". 보호자 사진 기록에 등록합니다.";
        }
        return "인식된 환자: "
                + listed
                + ". 보호자 사진 기록에 등록되지 않습니다.";
    }

    private static String stringVal(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    private static Number numberVal(Object v) {
        if (v instanceof Number n) {
            return n;
        }
        return 0;
    }

    @SuppressWarnings("unchecked")
    private static List<String> stringListVal(Object v) {
        if (!(v instanceof List<?> list)) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        for (Object item : list) {
            if (item != null) {
                String s = String.valueOf(item).trim();
                if (!s.isEmpty()) {
                    out.add(s);
                }
            }
        }
        return List.copyOf(out);
    }
}
