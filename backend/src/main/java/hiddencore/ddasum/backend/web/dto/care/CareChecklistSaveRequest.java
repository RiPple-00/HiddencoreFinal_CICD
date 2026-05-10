package hiddencore.ddasum.backend.web.dto.care;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareChecklistSaveRequest {

    /** 요양사 업무체크 본문(JSON). 프론트와 보호자 앱이 동일 스키마로 표시 */
    private JsonNode checklist;
}
