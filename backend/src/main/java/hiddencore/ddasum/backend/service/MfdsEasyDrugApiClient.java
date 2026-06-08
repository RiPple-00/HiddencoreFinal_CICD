package hiddencore.ddasum.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MfdsEasyDrugApiClient {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openapi.mfds.service-key}")
    private String serviceKey;

    private static final String EASY_DRUG_URL = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";

    public Map<String, Object> getEasyDrugInfo(String medicineName) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("drugInfoFound", false);

        try {
            String cleanName = cleanMedicineName(medicineName);

            if (cleanName.isBlank()) {
                result.put("drugInfoMessage", "약명이 비어 있어 상세 정보를 조회하지 못했습니다.");
                return result;
            }

            String url = EASY_DRUG_URL
                    + "?ServiceKey=" + serviceKey
                    + "&type=json"
                    + "&pageNo=1"
                    + "&numOfRows=1"
                    + "&itemName=" + URLEncoder.encode(cleanName, StandardCharsets.UTF_8);

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("body").path("items");
            JsonNode item = getFirstItem(items);

            if (item == null || item.isMissingNode() || item.isNull()) {
                result.put("drugInfoMessage", "식약처 e약은요 API에서 상세 정보를 찾지 못했습니다.");
                result.put("drugInfoSearchName", cleanName);
                return result;
            }

            result.put("drugInfoFound", true);
            result.put("drugInfoSearchName", cleanName);

            result.put("easyDrugItemName", text(item, "itemName"));
            result.put("effect", cleanText(text(item, "efcyQesitm")));
            result.put("useMethod", cleanText(text(item, "useMethodQesitm")));
            result.put("warning", cleanText(text(item, "atpnWarnQesitm")));
            result.put("caution", cleanText(text(item, "atpnQesitm")));
            result.put("interaction", cleanText(text(item, "intrcQesitm")));
            result.put("sideEffect", cleanText(text(item, "seQesitm")));
            result.put("storageMethod", cleanText(text(item, "depositMethodQesitm")));
            result.put("itemImage", text(item, "itemImage"));

            return result;

        } catch (Exception e) {
            result.put("drugInfoFound", false);
            result.put("drugInfoMessage", "식약처 상세 정보 조회 중 오류가 발생했습니다.");
            result.put("drugInfoError", e.getMessage());
            return result;
        }
    }

    public Map<String, Object> getEasyDrugInfoByItemSeq(String itemSeq) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("drugInfoFound", false);

        try {
            if (itemSeq == null || itemSeq.isBlank()) {
                result.put("drugInfoMessage", "품목기준코드가 비어 있어 e약은요 정보를 조회하지 못했습니다.");
                return result;
            }

            String url = EASY_DRUG_URL
                    + "?ServiceKey=" + serviceKey
                    + "&type=json"
                    + "&pageNo=1"
                    + "&numOfRows=1"
                    + "&itemSeq=" + URLEncoder.encode(itemSeq, StandardCharsets.UTF_8);

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("body").path("items");
            JsonNode item = getFirstItem(items);

            if (item == null || item.isMissingNode() || item.isNull()) {
                result.put("drugInfoMessage", "식약처 e약은요 API에서 품목기준코드로 상세 정보를 찾지 못했습니다.");
                result.put("drugInfoSearchItemSeq", itemSeq);
                return result;
            }

            result.put("drugInfoFound", true);
            result.put("drugInfoSearchItemSeq", itemSeq);

            result.put("easyDrugItemName", text(item, "itemName"));
            result.put("effect", cleanText(text(item, "efcyQesitm")));
            result.put("useMethod", cleanText(text(item, "useMethodQesitm")));
            result.put("warning", cleanText(text(item, "atpnWarnQesitm")));
            result.put("caution", cleanText(text(item, "atpnQesitm")));
            result.put("interaction", cleanText(text(item, "intrcQesitm")));
            result.put("sideEffect", cleanText(text(item, "seQesitm")));
            result.put("storageMethod", cleanText(text(item, "depositMethodQesitm")));
            result.put("itemImage", text(item, "itemImage"));

            return result;

        } catch (Exception e) {
            result.put("drugInfoFound", false);
            result.put("drugInfoMessage", "식약처 e약은요 품목기준코드 조회 중 오류가 발생했습니다.");
            result.put("drugInfoError", e.getMessage());
            return result;
        }
    }

    private JsonNode getFirstItem(JsonNode items) {
        if (items == null || items.isMissingNode() || items.isNull()) {
            return null;
        }

        if (items.isArray() && items.size() > 0) {
            return items.get(0);
        }

        if (items.isObject()) {
            return items;
        }

        return null;
    }

    private String cleanMedicineName(String medicineName) {
        if (medicineName == null) {
            return "";
        }

        String name = medicineName.split("_")[0].trim();

        int parenthesisIndex = name.indexOf("(");
        if (parenthesisIndex >= 0) {
            name = name.substring(0, parenthesisIndex);
        }

        return name.trim();
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("");
    }

    private String cleanText(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("<[^>]*>", "")
                .replace("&nbsp;", " ")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}