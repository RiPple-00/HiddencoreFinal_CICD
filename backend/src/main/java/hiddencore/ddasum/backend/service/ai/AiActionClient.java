package hiddencore.ddasum.backend.service.ai;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import hiddencore.ddasum.backend.config.GalleryDemoProperties;
import hiddencore.ddasum.backend.domain.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiActionClient {

    private static final DateTimeFormatter AI_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final int AI_CONNECT_TIMEOUT_MS = 5_000;
    private static final int AI_READ_TIMEOUT_MS = 45_000;

    private final GalleryDemoProperties galleryDemoProperties;
    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(AI_CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(AI_READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    public record MatchedProgram(Long postId, String title, String content) {}

    public record AiActionResult(
            String action,
            String actionKo,
            double confidence,
            MatchedProgram matchedProgram) {}

    public Optional<AiActionResult> classify(
            String absoluteImagePath, LocalDateTime takenAt, List<Post> programPosts) {
        String url = galleryDemoProperties.getAiServerBaseUrl().replaceAll("/$", "") + "/ai/action";

        List<Map<String, Object>> candidates = new ArrayList<>();
        for (Post post : programPosts) {
            if (post.getStartAt() == null || post.getEndAt() == null) {
                continue;
            }
            candidates.add(
                    Map.of(
                            "post_id",
                            post.getPostId(),
                            "title",
                            post.getTitle(),
                            "content",
                            post.getContent(),
                            "start_time",
                            post.getStartAt().format(AI_TIME),
                            "end_time",
                            post.getEndAt().format(AI_TIME)));
        }

        Map<String, Object> body =
                Map.of(
                        "image_path",
                        absoluteImagePath,
                        "taken_at",
                        takenAt.format(AI_TIME),
                        "program_candidates",
                        candidates);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return Optional.empty();
            }
            return Optional.of(parseBody(response.getBody()));
        } catch (RestClientException ex) {
            log.warn("AI action server call failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private static AiActionResult parseBody(Map<String, Object> body) {
        String action = stringVal(body.get("action"));
        String actionKo = stringVal(body.get("action_ko"));
        double confidence = numberVal(body.get("confidence"));

        MatchedProgram matched = null;
        Object mp = body.get("matched_program");
        if (mp instanceof Map<?, ?> map) {
            Object postId = map.get("post_id");
            matched =
                    new MatchedProgram(
                            postId instanceof Number n ? n.longValue() : null,
                            stringVal(map.get("title")),
                            stringVal(map.get("content")));
        }

        return new AiActionResult(action, actionKo, confidence, matched);
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
