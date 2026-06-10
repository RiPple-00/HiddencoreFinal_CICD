package hiddencore.ddasum.backend.service.translation;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.config.TranslationProperties;

@Service
public class OpenAiTranslationService implements TranslationService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiTranslationService.class);
    private static final String CACHE_NAME = "translation";

    private final RestTemplate restTemplate;
    private final TranslationProperties translationProperties;
    private final ObjectMapper objectMapper;

    public OpenAiTranslationService(RestTemplateBuilder restTemplateBuilder,
            TranslationProperties translationProperties, ObjectMapper objectMapper) {
        this.translationProperties = translationProperties;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(translationProperties.getOpenAi().getConnectTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(translationProperties.getOpenAi().getReadTimeoutMs()))
                .build();
    }

    @Override
    @Cacheable(cacheNames = CACHE_NAME, key = "#sourceLanguage + ':' + #targetLanguage + ':' + #text")
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) {
            return text == null ? "" : text;
        }

        if (!translationProperties.isEnabled()) {
            return text;
        }

        if (targetLanguage == null || targetLanguage.isBlank()) {
            throw new IllegalArgumentException("targetLanguage is required");
        }

        String normalizedSource = sourceLanguage == null || sourceLanguage.isBlank() ? "auto" : sourceLanguage.trim();
        String normalizedTarget = targetLanguage.trim();

        if (normalizedSource.equalsIgnoreCase(normalizedTarget)) {
            return text;
        }

        String prompt = buildPrompt(normalizedSource, normalizedTarget, text);
        String apiKey = translationProperties.getOpenAi().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenAI API key is not configured. Set OPENAI_API_KEY or app.translation.openai.api-key.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(apiKey);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("model", translationProperties.getOpenAi().getModel());
        request.put("temperature", translationProperties.getOpenAi().getTemperature());
        request.put("messages", List.of(
                Map.of("role", "system", "content",
                        "You are a precise translation assistant. Respond with the translated text only, without explanation or extra commentary."),
                Map.of("role", "user", "content", prompt)));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    translationProperties.getOpenAi().getApiUrl(), entity, JsonNode.class);

            if (response == null || response.getBody() == null) {
                log.warn("OpenAI translation response was empty.");
                return text;
            }

            JsonNode choices = response.getBody().path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                log.warn("OpenAI translation response did not contain choices: {}", response.getBody());
                return text;
            }

            String translatedText = choices.get(0).path("message").path("content").asText("").trim();
            return translatedText.isBlank() ? text : translatedText;
        } catch (RestClientException ex) {
            log.warn("OpenAI translation request failed: {}", ex.getMessage());
            return text;
        }
    }

    private String buildPrompt(String sourceLanguage, String targetLanguage, String text) {
        String instruction = sourceLanguage.equalsIgnoreCase("auto")
                ? String.format("Translate the following text into %s. Output only the translated text, no labels or explanations.", targetLanguage)
                : String.format("Translate the following text from %s to %s. Output only the translated text, no labels or explanations.", sourceLanguage, targetLanguage);
        return instruction + "\n\n" + text;
    }
}
