package hiddencore.ddasum.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MfdsDurApiClient {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mfds.dur.service-key}")
    private String serviceKey;

    private static final String DUR_BASE_URL = "http://apis.data.go.kr/1471000/DURPrdlstInfoService03";

    private static final String PRODUCT_ENDPOINT = "getDurPrdlstInfoList03";

    private static final Map<String, String> WARNING_ENDPOINTS = new LinkedHashMap<>();

    static {
        WARNING_ENDPOINTS.put("병용금기", "getUsjntTabooInfoList03");
        WARNING_ENDPOINTS.put("노인주의", "getOdsnAtentInfoList03");
        WARNING_ENDPOINTS.put("특정연령대금기", "getSpcifyAgrdeTabooInfoList03");
        WARNING_ENDPOINTS.put("용량주의", "getCpctyAtentInfoList03");
        WARNING_ENDPOINTS.put("투여기간주의", "getMdctnPdAtentInfoList03");
        WARNING_ENDPOINTS.put("효능군중복주의", "getEfcyDplctInfoList03");
        WARNING_ENDPOINTS.put("서방정분할주의", "getSeobangjeongPartitnAtentInfoList03");
        WARNING_ENDPOINTS.put("임부금기", "getPwnmTabooInfoList03");
    }

    // MedicationService에서 searchByMedicineName으로 호출 중이어도 호환되게 둠
    // 기존 호출 호환용
    public Map<String, Object> searchByMedicineName(String medicineName) {
        return getDurInfo(medicineName, null);
    }

    // permitItemSeq까지 받는 새 호출
    public Map<String, Object> searchByMedicineName(String medicineName, String permitItemSeq) {
        return getDurInfo(medicineName, permitItemSeq);
    }

    public Map<String, Object> getDurInfo(String medicineName) {
        return getDurInfo(medicineName, null);
    }

    public Map<String, Object> getDurInfo(String medicineName, String permitItemSeq) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("durInfoFound", false);

        String cleanName = cleanMedicineName(medicineName);

        if ((cleanName == null || cleanName.isBlank())
                && (permitItemSeq == null || permitItemSeq.isBlank())) {
            result.put("durInfoMessage", "약명과 품목기준코드가 비어 있어 DUR 정보를 조회하지 못했습니다.");
            return result;
        }

        result.put("durSearchName", cleanName);
        result.put("durSearchItemSeq", permitItemSeq);

        List<Map<String, Object>> warnings = new ArrayList<>();
        List<String> apiErrors = new ArrayList<>();
        int successCount = 0;

        JsonNode productItems = null;

        try {
            productItems = requestItems(PRODUCT_ENDPOINT, cleanName, permitItemSeq);
            JsonNode productItem = firstItem(productItems);

            if (productItem != null) {
                result.put("durProductFound", true);
                result.put("durProductInfo", toProductInfo(productItem));
                successCount++;
            } else {
                result.put("durProductFound", false);
            }
        } catch (Exception e) {
            apiErrors.add("DUR품목정보: " + e.getMessage());
        }

        Set<String> targetCategories = extractDurCategories(productItems);
        result.put("durTargetCategories", new ArrayList<>(targetCategories));

        if (targetCategories.isEmpty()) {
            result.put("durWarnings", warnings);
            result.put("durWarningCount", 0);

            if (!apiErrors.isEmpty()) {
                result.put("durApiErrors", apiErrors);
            }

            result.put("durInfoFound", false);
            result.put("durInfoMessage", "DUR 주의사항 없음");
            return result;
        }

        for (String category : targetCategories) {
            String endpoint = WARNING_ENDPOINTS.get(category);

            if (endpoint == null) {
                continue;
            }

            try {
                JsonNode items = requestItems(endpoint, cleanName, permitItemSeq);
                warnings.addAll(toWarningList(items, category));
                successCount++;
            } catch (Exception e) {
                apiErrors.add(category + ": " + e.getMessage());
            }
        }

        result.put("durWarnings", warnings);
        result.put("durWarningCount", warnings.size());

        if (!apiErrors.isEmpty()) {
            result.put("durApiErrors", apiErrors);
        }

        if (!warnings.isEmpty()) {
            result.put("durInfoFound", true);
            result.put("durInfoMessage", "DUR 주의사항 정보를 조회했습니다.");
            return result;
        }

        if (successCount > 0) {
            result.put("durInfoFound", false);
            result.put("durInfoMessage", "DUR API 조회는 성공했지만 해당 약품의 주의사항 결과는 없습니다.");
            return result;
        }

        result.put("durInfoFound", false);
        result.put("durInfoMessage", "DUR API 조회 중 오류가 발생했습니다.");
        return result;
    }

    private Set<String> extractDurCategories(JsonNode items) {
        Set<String> categories = new LinkedHashSet<>();

        if (items == null || items.isMissingNode() || items.isNull()) {
            return categories;
        }

        if (items.isArray()) {
            for (JsonNode item : items) {
                addDurCategory(categories, item);
            }
            return categories;
        }

        if (items.isObject()) {
            addDurCategory(categories, items);
        }

        return categories;
    }

    private void addDurCategory(Set<String> categories, JsonNode item) {
        String typeName = text(
                item,
                "TYPE_NAME",
                "TYPE_NAME  ",
                "typeName",
                "durTypeName");

        if (typeName == null || typeName.isBlank()) {
            return;
        }

        String cleanedTypeName = typeName.trim();

        if (WARNING_ENDPOINTS.containsKey(cleanedTypeName)) {
            categories.add(cleanedTypeName);
        }
    }

    private JsonNode requestItems(String endpoint, String cleanName, String permitItemSeq) throws Exception {
        StringBuilder urlBuilder = new StringBuilder();

        urlBuilder.append(DUR_BASE_URL)
                .append("/")
                .append(endpoint)
                .append("?serviceKey=")
                .append(serviceKey)
                .append("&type=json")
                .append("&pageNo=1")
                .append("&numOfRows=20");

        if (permitItemSeq != null && !permitItemSeq.isBlank()) {
            urlBuilder.append("&itemSeq=")
                    .append(URLEncoder.encode(permitItemSeq, StandardCharsets.UTF_8));
        } else {
            urlBuilder.append("&itemName=")
                    .append(URLEncoder.encode(cleanName, StandardCharsets.UTF_8));
        }

        String url = urlBuilder.toString();

        System.out.println("DUR 요청 URL = " + url);

        try {
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("DUR 응답(" + endpoint + ") = " + response);

            JsonNode root = objectMapper.readTree(response);
            return extractItems(root);

        } catch (HttpStatusCodeException e) {
            throw new RuntimeException(e.getStatusCode() + " / " + e.getResponseBodyAsString());
        }
    }

    private JsonNode extractItems(JsonNode root) {
        if (root == null || root.isMissingNode() || root.isNull()) {
            return null;
        }

        JsonNode itemNode = root.path("response").path("body").path("items").path("item");
        if (!itemNode.isMissingNode() && !itemNode.isNull()) {
            return itemNode;
        }

        JsonNode responseItems = root.path("response").path("body").path("items");
        if (!responseItems.isMissingNode() && !responseItems.isNull()) {
            return responseItems;
        }

        JsonNode bodyItemNode = root.path("body").path("items").path("item");
        if (!bodyItemNode.isMissingNode() && !bodyItemNode.isNull()) {
            return bodyItemNode;
        }

        JsonNode bodyItems = root.path("body").path("items");
        if (!bodyItems.isMissingNode() && !bodyItems.isNull()) {
            return bodyItems;
        }

        return null;
    }

    private JsonNode firstItem(JsonNode items) {
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

    private Map<String, Object> toProductInfo(JsonNode item) {
        Map<String, Object> product = new LinkedHashMap<>();

        product.put("itemSeq", text(item, "ITEM_SEQ", "itemSeq"));
        product.put("itemName", text(item, "ITEM_NAME", "itemName"));
        product.put("entpName", text(item, "ENTP_NAME", "entpName"));
        product.put("ingredientName", text(item, "INGR_NAME", "ING_NAME", "MAIN_INGR", "ingredientName"));
        product.put("etcOtcName", text(item, "ETC_OTC_NAME", "ETC_OTC_CODE", "etcOtcName"));
        product.put("className", text(item, "CLASS_NAME", "className"));
        product.put("chart", cleanText(text(item, "CHART", "chart")));

        return product;
    }

    private List<Map<String, Object>> toWarningList(JsonNode items, String category) {
        List<Map<String, Object>> list = new ArrayList<>();

        if (items == null || items.isMissingNode() || items.isNull()) {
            return list;
        }

        if (items.isArray()) {
            for (JsonNode item : items) {
                Map<String, Object> warning = toWarningInfo(item, category);
                if (!warning.isEmpty()) {
                    list.add(warning);
                }
            }
            return list;
        }

        if (items.isObject()) {
            Map<String, Object> warning = toWarningInfo(items, category);
            if (!warning.isEmpty()) {
                list.add(warning);
            }
        }

        return list;
    }

    private Map<String, Object> toWarningInfo(JsonNode item, String category) {
        Map<String, Object> warning = new LinkedHashMap<>();

        String itemName = text(item, "ITEM_NAME", "itemName");
        String entpName = text(item, "ENTP_NAME", "entpName");
        String ingredientName = text(item, "INGR_NAME", "ING_NAME", "MATERIAL_NAME", "ingredientName");
        String mixtureItemName = text(item, "MIXTURE_ITEM_NAME", "MIXTURE_ITEM_NAME1", "MIX_ITEM_NAME",
                "mixtureItemName");
        String mixtureIngredientName = text(item, "MIXTURE_INGR_NAME", "MIXTURE_ING_NAME", "MIX_INGR_NAME",
                "mixtureIngredientName");
        String content = cleanText(text(
                item,
                "PROHBT_CONTENT",
                "DUR_CONTENT",
                "ATENT_CONTENT",
                "LIMIT_CONTENT",
                "REMARK",
                "NOTE",
                "content"));

        String notificationDate = text(item, "NOTIFICATION_DATE", "NOTICE_DATE", "REG_DATE", "notificationDate");

        if (itemName.isBlank()
                && ingredientName.isBlank()
                && mixtureItemName.isBlank()
                && mixtureIngredientName.isBlank()
                && content.isBlank()) {
            return warning;
        }

        warning.put("durCategory", category);
        warning.put("durItemSeq", text(item, "ITEM_SEQ", "itemSeq"));
        warning.put("durItemName", itemName);
        warning.put("durEntpName", entpName);
        warning.put("durIngredientName", ingredientName);
        warning.put("durMixtureItemName", mixtureItemName);
        warning.put("durMixtureIngredientName", mixtureIngredientName);
        warning.put("durContent", content);
        warning.put("durNotificationDate", notificationDate);

        return warning;
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

    private String text(JsonNode node, String... fieldNames) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }

        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (!value.isMissingNode() && !value.isNull()) {
                String text = value.asText("");
                if (!text.isBlank()) {
                    return text;
                }
            }
        }

        Iterator<String> names = node.fieldNames();

        while (names.hasNext()) {
            String actualName = names.next();

            for (String expectedName : fieldNames) {
                if (actualName.equalsIgnoreCase(expectedName)) {
                    String text = node.path(actualName).asText("");
                    if (!text.isBlank()) {
                        return text;
                    }
                }
            }
        }

        return "";
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