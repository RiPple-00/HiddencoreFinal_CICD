package hiddencore.ddasum.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MedicationApiClient {

    private final ObjectMapper objectMapper;

    @Value("${drug.api.service-key}")
    private String serviceKey;

    public Optional<DrugInfo> searchByMedicineName(String medicineName) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String encodedMedicineName = URLEncoder.encode(medicineName, StandardCharsets.UTF_8);

            String url = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"
                    + "?serviceKey=" + serviceKey
                    + "&pageNo=1"
                    + "&numOfRows=1"
                    + "&type=json"
                    + "&itemName=" + encodedMedicineName;

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("body").path("items");

            if (!items.isArray() || items.isEmpty()) {
                return Optional.empty();
            }

            JsonNode item = items.get(0);

            return Optional.of(
                    DrugInfo.builder()
                            .itemSeq(getText(item, "itemSeq"))
                            .entpName(getText(item, "entpName"))
                            .itemName(getText(item, "itemName"))
                            .efficacy(getText(item, "efcyQesitm"))
                            .useMethod(getText(item, "useMethodQesitm"))
                            .cautionWarning(getText(item, "atpnWarnQesitm"))
                            .caution(getText(item, "atpnQesitm"))
                            .interaction(getText(item, "intrcQesitm"))
                            .sideEffect(getText(item, "seQesitm"))
                            .storageMethod(getText(item, "depositMethodQesitm"))
                            .build());

        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<DrugInfo> searchByItemSeq(String itemSeq) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String url = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"
                    + "?serviceKey=" + serviceKey
                    + "&pageNo=1"
                    + "&numOfRows=1"
                    + "&type=json"
                    + "&itemSeq=" + itemSeq;

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("body").path("items");

            if (!items.isArray() || items.isEmpty()) {
                return Optional.empty();
            }

            JsonNode item = items.get(0);

            return Optional.of(
                    DrugInfo.builder()
                            .itemSeq(getText(item, "itemSeq"))
                            .entpName(getText(item, "entpName"))
                            .itemName(getText(item, "itemName"))
                            .efficacy(getText(item, "efcyQesitm"))
                            .useMethod(getText(item, "useMethodQesitm"))
                            .cautionWarning(getText(item, "atpnWarnQesitm"))
                            .caution(getText(item, "atpnQesitm"))
                            .interaction(getText(item, "intrcQesitm"))
                            .sideEffect(getText(item, "seQesitm"))
                            .storageMethod(getText(item, "depositMethodQesitm"))
                            .build());

        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String getText(JsonNode node, String fieldName) {
        String value = node.path(fieldName).asText(null);

        if (value == null || value.isBlank()) {
            return null;
        }

        return value;
    }

    @Getter
    @Builder
    public static class DrugInfo {
        private String itemSeq;
        private String entpName;
        private String itemName;
        private String efficacy;
        private String useMethod;
        private String cautionWarning;
        private String caution;
        private String interaction;
        private String sideEffect;
        private String storageMethod;
    }
}