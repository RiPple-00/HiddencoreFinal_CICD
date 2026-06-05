package hiddencore.ddasum.backend.service.ai;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import hiddencore.ddasum.backend.service.ai.AiActionClient.AiActionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalPythonActionClassifier {

    private static final int PROCESS_TIMEOUT_SEC = 90;

    private final GalleryDemoProperties galleryDemoProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<AiActionResult> classify(String absoluteImagePath) {
        Path aiHome = galleryDemoProperties.resolveAiServerHome();
        Path script = aiHome.resolve("scripts").resolve("classify_once.py");
        if (!script.toFile().isFile()) {
            log.warn("Local AI script not found: {}", script);
            return Optional.empty();
        }

        ProcessBuilder builder =
                new ProcessBuilder(
                        galleryDemoProperties.getPythonExecutable(),
                        script.toString(),
                        Path.of(absoluteImagePath).toAbsolutePath().toString());
        builder.directory(aiHome.toFile());
        builder.redirectErrorStream(true);

        try {
            Process process = builder.start();
            boolean finished = process.waitFor(PROCESS_TIMEOUT_SEC, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("Local AI classify timed out");
                return Optional.empty();
            }

            String output;
            try (BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().reduce((a, b) -> b).orElse("");
            }

            if (process.exitValue() != 0) {
                log.warn("Local AI classify failed (exit {}): {}", process.exitValue(), output);
                return Optional.empty();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = objectMapper.readValue(output, Map.class);
            if (body.containsKey("error")) {
                log.warn("Local AI classify error: {}", body.get("error"));
                return Optional.empty();
            }

            return Optional.of(
                    new AiActionResult(
                            stringVal(body.get("action")),
                            stringVal(body.get("action_ko")),
                            numberVal(body.get("confidence")),
                            null));
        } catch (Exception ex) {
            log.warn("Local AI classify exception: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static String stringVal(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    private static double numberVal(Object v) {
        if (v instanceof Number n) {
            return n.doubleValue();
        }
        return 0.0;
    }
}
