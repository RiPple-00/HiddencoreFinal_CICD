package hiddencore.ddasum.backend.web.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import hiddencore.ddasum.backend.domain.Patient;

import java.io.IOException;

/** 빈 문자열·알 수 없는 값은 null (선택 입력 gender) */
public class GenderJsonDeserializer extends JsonDeserializer<Patient.Gender> {

    @Override
    public Patient.Gender deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == null) {
            return null;
        }
        String v = p.getValueAsString();
        if (v == null || v.isBlank()) {
            return null;
        }
        try {
            return Patient.Gender.valueOf(v.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
