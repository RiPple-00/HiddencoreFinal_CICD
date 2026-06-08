package hiddencore.ddasum.backend.web.dto.translation;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class TranslationRequest {

    @NotBlank
    private String text;
    private String sourceLanguage;
    private List<String> targetLanguages;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public void setSourceLanguage(String sourceLanguage) {
        this.sourceLanguage = sourceLanguage;
    }

    public List<String> getTargetLanguages() {
        return targetLanguages;
    }

    public void setTargetLanguages(List<String> targetLanguages) {
        this.targetLanguages = targetLanguages;
    }
}
