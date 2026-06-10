package hiddencore.ddasum.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HiraMedicationApiClient {

    @Value("${hira.api.service-key}")
    private String serviceKey;

    private static final int CONNECT_TIMEOUT_MS = 4_000;
    private static final int READ_TIMEOUT_MS = 8_000;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    public Optional<HiraDrugInfo> searchByMdsCd(String mdsCd) {
        try {
            String url = "http://apis.data.go.kr/B551182/dgamtCrtrInfoService1.2/getDgamtList"
                    + "?serviceKey=" + serviceKey
                    + "&pageNo=1"
                    + "&numOfRows=10"
                    + "&mdsCd=" + mdsCd;

            String response = restTemplate.getForObject(URI.create(url), String.class);

            if (response == null || response.isBlank()) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response);

            JsonNode header = root.path("response").path("header");
            String resultCode = getText(header, "resultCode");

            if (!"00".equals(resultCode)) {
                System.out.println("[HIRA API 오류] resultCode=" + resultCode);
                System.out.println("[HIRA API 오류] resultMsg=" + getText(header, "resultMsg"));
                return Optional.empty();
            }

            JsonNode itemNode = root.path("response")
                    .path("body")
                    .path("items")
                    .path("item");

            if (itemNode.isMissingNode() || itemNode.isNull()) {
                return Optional.empty();
            }

            // item이 배열로 올 수도 있어서 첫 번째 값 처리
            if (itemNode.isArray()) {
                if (itemNode.isEmpty()) {
                    return Optional.empty();
                }
                itemNode = itemNode.get(0);
            }

            HiraDrugInfo drugInfo = HiraDrugInfo.builder()
                    .mdsCd(getText(itemNode, "mdsCd"))
                    .itemName(getText(itemNode, "itmNm"))
                    .manufacturerName(getText(itemNode, "mnfEntpNm"))
                    .unit(getText(itemNode, "unit"))
                    .payType(getText(itemNode, "payTpNm"))
                    .route(getText(itemNode, "injcPthNm"))
                    .classNo(getText(itemNode, "meftDivNo"))
                    .mainIngredientCode(getText(itemNode, "gnlNmCd"))
                    .applyStartDate(getText(itemNode, "adtStaDd"))
                    .applyEndDate(getText(itemNode, "adtEndDd"))
                    .maxPrice(getText(itemNode, "mxCprc"))
                    .specialGeneralType(getText(itemNode, "spcGnlTpNm"))
                    .substitutionType(getText(itemNode, "sbstPsblTpNm"))
                    .build();

            return Optional.of(drugInfo);

        } catch (Exception e) {
            System.out.println("[HIRA API 조회 실패] mdsCd=" + mdsCd);
            System.out.println(e.getMessage());
            return Optional.empty();
        }
    }

    private String getText(JsonNode node, String fieldName) {
        JsonNode valueNode = node.path(fieldName);

        if (valueNode.isMissingNode() || valueNode.isNull()) {
            return null;
        }

        String value = valueNode.asText();

        return value == null || value.isBlank() ? null : value;
    }

    @Getter
    @Builder
    public static class HiraDrugInfo {
        private String mdsCd;               // 제품코드
        private String itemName;            // 약품명
        private String manufacturerName;    // 제조사
        private String unit;                // 단위
        private String payType;             // 급여구분
        private String route;               // 투여경로
        private String classNo;             // 약효분류/분류번호
        private String mainIngredientCode;  // 주성분코드
        private String applyStartDate;      // 적용시작일
        private String applyEndDate;        // 적용종료일
        private String maxPrice;            // 상한금액
        private String specialGeneralType;  // 전문/일반
        private String substitutionType;    // 대체/생동성 정보
    }
}