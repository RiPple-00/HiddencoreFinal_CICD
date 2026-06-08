package hiddencore.ddasum.backend.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.translation.TranslationService;
import hiddencore.ddasum.backend.web.dto.translation.TranslationBatchRequest;
import hiddencore.ddasum.backend.web.dto.translation.TranslationRequest;
import hiddencore.ddasum.backend.web.dto.translation.TranslationResponse;

@Validated
@RestController
@RequestMapping("/api/v1/translations")
public class TranslationController {

    private final TranslationService translationService;

    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PostMapping
    public ResponseEntity<TranslationResponse> translate(@Valid @RequestBody TranslationRequest request) {
        String text = request.getText();
        String sourceLanguage = request.getSourceLanguage();
        List<String> targetLanguages = request.getTargetLanguages();

        if (targetLanguages == null || targetLanguages.isEmpty()) {
            targetLanguages = List.of("ko", "en");
        }

        Map<String, String> translations = new LinkedHashMap<>();
        for (String targetLanguage : targetLanguages) {
            translations.put(targetLanguage, translationService.translate(text, sourceLanguage, targetLanguage));
        }

        TranslationResponse response = new TranslationResponse(text, sourceLanguage, translations);
        return ResponseEntity.ok(response);
    }

    /** 여러 텍스트를 한 번에 번역 — 입력 순서와 동일한 순서로 번역 결과 반환 */
    @PostMapping("/batch")
    public ResponseEntity<List<String>> translateBatch(@Valid @RequestBody TranslationBatchRequest request) {
        String sourceLanguage = request.getSourceLanguage();
        String targetLanguage = request.getTargetLanguage();

        List<String> results = request.getTexts().stream()
                .map(text -> translationService.translate(text, sourceLanguage, targetLanguage))
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }
}
