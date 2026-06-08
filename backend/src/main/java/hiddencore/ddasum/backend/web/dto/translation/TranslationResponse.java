package hiddencore.ddasum.backend.web.dto.translation;

import java.util.Map;

public class TranslationResponse {

    private String originalText;
    private String sourceLanguage;
    private Map<String, String> translations;

    public TranslationResponse() {
    }

    public TranslationResponse(String originalText, String sourceLanguage, Map<String, String> translations) {
        this.originalText = originalText;
        this.sourceLanguage = sourceLanguage;
        this.translations = translations;
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public void setSourceLanguage(String sourceLanguage) {
        this.sourceLanguage = sourceLanguage;
    }

    public Map<String, String> getTranslations() {
        return translations;
    }

    public void setTranslations(Map<String, String> translations) {
        this.translations = translations;
    }
}
