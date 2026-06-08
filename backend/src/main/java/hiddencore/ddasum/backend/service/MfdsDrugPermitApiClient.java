package hiddencore.ddasum.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MfdsDrugPermitApiClient {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mfds.permit.service-key}")
    private String serviceKey;

    private static final String PERMIT_LIST_URL = "http://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07";

    private static final String PERMIT_DETAIL_URL = "http://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnDtlInq06";

    public Map<String, Object> getPermitInfo(String medicineName, String manufacturerName) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("permitInfoFound", false);

        try {
            String cleanName = cleanMedicineName(medicineName);

            if (cleanName.isBlank()) {
                result.put("permitInfoMessage", "약명이 비어 있어 허가정보를 조회하지 못했습니다.");
                return result;
            }

            String url = PERMIT_LIST_URL
                    + "?serviceKey=" + serviceKey
                    + "&type=json"
                    + "&pageNo=1"
                    + "&numOfRows=5"
                    + "&item_name=" + URLEncoder.encode(cleanName, StandardCharsets.UTF_8);

            String response = restTemplate.getForObject(url, String.class);
            System.out.println("허가정보 요청 URL = " + url);
            System.out.println("허가정보 응답 = " + response);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = extractItems(root);
            JsonNode item = selectBestItem(items, cleanName, manufacturerName);

            if (item == null) {
                result.put("permitInfoMessage", "식약처 허가정보 API에서 상세 정보를 찾지 못했습니다.");
                result.put("permitSearchName", cleanName);
                return result;
            }

            result.put("permitInfoFound", true);
            result.put("permitSearchName", cleanName);

            result.put("permitItemSeq", text(item, "ITEM_SEQ"));
            result.put("permitItemName", text(item, "ITEM_NAME"));
            result.put("permitEntpName", text(item, "ENTP_NAME"));
            result.put("permitChart", cleanText(text(item, "CHART")));
            result.put("permitStorageMethod", cleanText(text(item, "STORAGE_METHOD")));
            result.put("permitValidTerm", cleanText(text(item, "VALID_TERM")));
            result.put("permitEtcOtcCode", text(item, "ETC_OTC_CODE"));
            result.put("permitMaterialName", cleanText(text(item, "MATERIAL_NAME")));

            result.put("permitEffect", cleanText(text(item, "EE_DOC_DATA")));
            result.put("permitUseMethod", cleanText(text(item, "UD_DOC_DATA")));
            result.put("permitCaution", cleanText(text(item, "NB_DOC_DATA")));

            return result;

        } catch (HttpStatusCodeException e) {
            result.put("permitInfoFound", false);
            result.put("permitInfoMessage", "식약처 허가정보 조회 중 오류가 발생했습니다.");
            result.put("permitInfoError", e.getStatusCode() + " / " + e.getResponseBodyAsString());
            return result;

        } catch (Exception e) {
            result.put("permitInfoFound", false);
            result.put("permitInfoMessage", "식약처 허가정보 조회 중 오류가 발생했습니다.");
            result.put("permitInfoError", e.getMessage());
            return result;
        }
    }

    private JsonNode selectBestItem(JsonNode items, String cleanName, String manufacturerName) {
        if (items == null || items.isMissingNode() || items.isNull()) {
            return null;
        }

        if (items.isObject()) {
            return items;
        }

        if (!items.isArray() || items.size() == 0) {
            return null;
        }

        JsonNode first = items.get(0);

        if (manufacturerName == null || manufacturerName.isBlank()) {
            return first;
        }

        for (JsonNode item : items) {
            String itemName = text(item, "ITEM_NAME");
            String entpName = text(item, "ENTP_NAME");

            boolean nameMatched = itemName.contains(cleanName) || cleanName.contains(itemName);
            boolean entpMatched = entpName.contains(manufacturerName) || manufacturerName.contains(entpName);

            if (nameMatched && entpMatched) {
                return item;
            }
        }

        return first;
    }

    private JsonNode extractItems(JsonNode root) {
        if (root == null || root.isMissingNode() || root.isNull()) {
            return null;
        }

        // 형태 1: response.body.items.item
        JsonNode itemNode = root.path("response").path("body").path("items").path("item");
        if (!itemNode.isMissingNode() && !itemNode.isNull()) {
            return itemNode;
        }

        // 형태 2: response.body.items
        JsonNode responseItems = root.path("response").path("body").path("items");
        if (!responseItems.isMissingNode() && !responseItems.isNull()) {
            return responseItems;
        }

        // 형태 3: body.items.item
        JsonNode bodyItemNode = root.path("body").path("items").path("item");
        if (!bodyItemNode.isMissingNode() && !bodyItemNode.isNull()) {
            return bodyItemNode;
        }

        // 형태 4: body.items
        JsonNode bodyItems = root.path("body").path("items");
        if (!bodyItems.isMissingNode() && !bodyItems.isNull()) {
            return bodyItems;
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

    private String maskServiceKey(String url) {
        if (url == null) {
            return "";
        }

        return url.replaceAll("serviceKey=([^&]+)", "serviceKey=***");
    }

    private String cleanDocText(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replaceAll("<ARTICLE[^>]*title=\"([^\"]*)\"[^>]*/>", "\n$1\n")
                .replaceAll("<ARTICLE[^>]*title=\"([^\"]*)\"[^>]*>", "\n$1\n")
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("<[^>]*>", "\n")
                .replace("&nbsp;", " ")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .replaceAll("\\n\\s*\\n+", "\n\n")
                .trim();
    }

    public Map<String, Object> getPermitInfoByEdiCode(String ediCode) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("permitInfoFound", false);

        try {
            if (ediCode == null || ediCode.isBlank()) {
                result.put("permitInfoMessage", "EDI 코드가 비어 있어 허가정보를 조회하지 못했습니다.");
                return result;
            }

            String url = PERMIT_LIST_URL
                    + "?serviceKey=" + serviceKey
                    + "&type=json"
                    + "&pageNo=1"
                    + "&numOfRows=5"
                    + "&edi_code=" + URLEncoder.encode(ediCode, StandardCharsets.UTF_8);

            System.out.println("허가정보 EDI 요청 URL = " + url);

            String response = restTemplate.getForObject(url, String.class);

            System.out.println("허가정보 EDI 응답 = " + response);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = extractItems(root);
            JsonNode item = selectBestItem(items, "", "");

            if (item == null) {
                result.put("permitInfoMessage", "식약처 허가정보 API에서 EDI 코드로 상세 정보를 찾지 못했습니다.");
                result.put("permitSearchEdiCode", ediCode);
                return result;
            }

            result.put("permitInfoFound", true);
            result.put("permitSearchEdiCode", ediCode);

            result.put("permitItemSeq", text(item, "ITEM_SEQ"));
            result.put("permitItemName", text(item, "ITEM_NAME"));
            result.put("permitEntpName", text(item, "ENTP_NAME"));
            result.put("permitEdiCode", text(item, "EDI_CODE"));
            result.put("permitChart", cleanText(text(item, "CHART")));
            result.put("permitStorageMethod", cleanText(text(item, "STORAGE_METHOD")));
            result.put("permitValidTerm", cleanText(text(item, "VALID_TERM")));
            result.put("permitEtcOtcCode", text(item, "ETC_OTC_CODE"));
            result.put("permitMaterialName", cleanText(text(item, "MATERIAL_NAME")));

            result.put("permitEffect", cleanText(text(item, "EE_DOC_DATA")));
            result.put("permitUseMethod", cleanText(text(item, "UD_DOC_DATA")));
            result.put("permitCaution", cleanText(text(item, "NB_DOC_DATA")));

            return result;

        } catch (Exception e) {
            result.put("permitInfoFound", false);
            result.put("permitInfoMessage", "식약처 허가정보 EDI 코드 조회 중 오류가 발생했습니다.");
            result.put("permitInfoError", e.getMessage());
            return result;
        }
    }

    public Map<String, Object> getPermitDetailByItemSeq(String itemSeq) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("permitDetailFound", false);

        try {
            if (itemSeq == null || itemSeq.isBlank()) {
                result.put("permitDetailMessage", "품목기준코드가 비어 있어 허가 상세정보를 조회하지 못했습니다.");
                return result;
            }

            String url = PERMIT_DETAIL_URL
                    + "?serviceKey=" + serviceKey
                    + "&type=json"
                    + "&pageNo=1"
                    + "&numOfRows=1"
                    + "&item_seq=" + URLEncoder.encode(itemSeq, StandardCharsets.UTF_8);

            System.out.println("허가 상세정보 요청 URL = " + maskServiceKey(url));

            String response = restTemplate.getForObject(url, String.class);

            System.out.println("허가 상세정보 응답 = " + response);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = extractItems(root);
            JsonNode item = selectBestItem(items, "", "");

            if (item == null) {
                result.put("permitDetailMessage", "식약처 허가 상세정보 API에서 정보를 찾지 못했습니다.");
                result.put("permitDetailSearchItemSeq", itemSeq);
                return result;
            }

            result.put("permitDetailFound", true);
            result.put("permitDetailSearchItemSeq", itemSeq);

            result.put("permitItemSeq", text(item, "ITEM_SEQ"));
            result.put("permitItemName", text(item, "ITEM_NAME"));
            result.put("permitEntpName", text(item, "ENTP_NAME"));
            result.put("permitEdiCode", text(item, "EDI_CODE"));

            result.put("permitChart", cleanText(text(item, "CHART")));
            result.put("permitStorageMethod", cleanText(text(item, "STORAGE_METHOD")));
            result.put("permitValidTerm", cleanText(text(item, "VALID_TERM")));
            result.put("permitMaterialName", cleanText(text(item, "MATERIAL_NAME")));

            result.put("permitEffect", cleanDocText(text(item, "EE_DOC_DATA")));
            result.put("permitUseMethod", cleanDocText(text(item, "UD_DOC_DATA")));
            result.put("permitCaution", cleanDocText(text(item, "NB_DOC_DATA")));

            return result;

        } catch (Exception e) {
            result.put("permitDetailFound", false);
            result.put("permitDetailMessage", "식약처 허가 상세정보 조회 중 오류가 발생했습니다.");
            result.put("permitDetailError", e.getMessage());
            return result;
        }
    }
}