package hiddencore.ddasum.backend.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.zip.InflaterInputStream;

import org.springframework.stereotype.Component;

@Component
public class EdbQrDecoder {

    public String decode(String qrRawData) {
        try {
            byte[] decodedBytes = decodeToBytes(qrRawData);

            String decodedText = new String(decodedBytes, Charset.forName("MS949"));
            String utf8Text = new String(decodedBytes, StandardCharsets.UTF_8);

            String[] fields = decodedText.split(";");

            StringBuilder fieldResult = new StringBuilder();

            for (int i = 0; i < fields.length; i++) {
                fieldResult
                        .append("[")
                        .append(i)
                        .append("] ")
                        .append(fields[i])
                        .append("\n");
            }

            List<String> medicationCodes = extractMedicationCodes(fields);

            StringBuilder medicationCodeResult = new StringBuilder();

            for (int i = 0; i < medicationCodes.size(); i++) {
                medicationCodeResult
                        .append(i + 1)
                        .append(". ")
                        .append(medicationCodes.get(i))
                        .append("\n");
            }

            return """
                    [MS949 디코딩 결과]
                    %s

                    [필드 분리 결과]
                    %s

                    [약 코드 추출 결과]
                    %s

                    [UTF-8 디코딩 결과]
                    %s

                    [디코딩 바이트 길이]
                    %d
                    """.formatted(
                    decodedText,
                    fieldResult.toString(),
                    medicationCodeResult.toString(),
                    utf8Text,
                    decodedBytes.length);

        } catch (Exception e) {
            return "디코딩 실패: " + e.getMessage();
        }
    }

    public List<String> extractMedicationCodesFromQr(String qrRawData) {
        try {
            byte[] decodedBytes = decodeToBytes(qrRawData);

            String decodedText = new String(decodedBytes, Charset.forName("MS949"));

            String[] fields = decodedText.split(";");

            return extractMedicationCodes(fields);

        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private byte[] decodeToBytes(String qrRawData) throws Exception {
        if (qrRawData == null || qrRawData.isBlank()) {
            throw new IllegalArgumentException("QR 원문이 비어 있습니다.");
        }

        String raw = qrRawData.trim();

        // URL 처리 중 +가 공백으로 바뀌는 경우 대비
        raw = raw.replace("? MLK", "?+MLK");
        raw = raw.replace(" MLK", "+MLK");

        /*
         * 기존에 잘 되던 QR 형식
         * 예: ?+MLK+압축Base64데이터
         */
        String compressedMarker = "?+MLK+";
        int compressedMarkerIndex = raw.indexOf(compressedMarker);

        if (compressedMarkerIndex != -1) {
            String payload = raw.substring(compressedMarkerIndex + compressedMarker.length());

            payload = payload.replace(" ", "+");

            byte[] compressedBytes = Base64.getDecoder().decode(payload);

            InflaterInputStream inflaterInputStream = new InflaterInputStream(
                    new ByteArrayInputStream(compressedBytes));

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            byte[] buffer = new byte[1024];
            int length;

            while ((length = inflaterInputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, length);
            }

            return outputStream.toByteArray();
        }

        /*
         * 이번에 실패한 QR 형식
         * 예: ?+MLK:>:S<^.;;-/-)...
         * 이미 세미콜론으로 필드가 나뉜 원문형이라 Base64 디코딩하면 안 됨
         */
        String plainMarker = "?+MLK:";
        int plainMarkerIndex = raw.indexOf(plainMarker);

        if (plainMarkerIndex != -1) {
            String payload = raw.substring(plainMarkerIndex + plainMarker.length());

            // QR 원문 안의 깨진 한글 바이트를 MS949로 다시 해석할 수 있게 ISO-8859-1 바이트로 복원
            return payload.getBytes(StandardCharsets.ISO_8859_1);
        }

        throw new IllegalArgumentException("EDB QR 형식이 아닙니다.");
    }

    private List<String> extractMedicationCodes(String[] fields) {
        List<String> medicationCodes = new ArrayList<>();

        for (String field : fields) {
            if (field == null) {
                continue;
            }

            if (field.startsWith("<]") && field.length() >= 13) {
                String encodedCode = field.substring(4, 13);
                String decodedCode = decodeNumber(encodedCode);

                if (decodedCode.length() == 9) {
                    medicationCodes.add(decodedCode);
                }
            }
        }

        return medicationCodes;
    }

    private String decodeNumber(String encoded) {
        StringBuilder result = new StringBuilder();

        for (char ch : encoded.toCharArray()) {
            Character digit = decodeDigitChar(ch);

            if (digit == null) {
                return "";
            }

            result.append(digit);
        }

        return result.toString();
    }

    private Character decodeDigitChar(char ch) {
        return switch (ch) {
            case '/' -> '0';
            case '.' -> '1';
            case '-' -> '2';
            case ',' -> '3';
            case '+' -> '4';
            case '*' -> '5';
            case ')' -> '6';
            case '(' -> '7';
            case '\'' -> '8';
            case '&' -> '9';
            default -> null;
        };
    }

    public LocalDate extractPrescriptionDateFromQr(String qrRawData) {
        try {
            byte[] decodedBytes = decodeToBytes(qrRawData);

            String decodedText = new String(decodedBytes, Charset.forName("MS949"));

            String[] fields = decodedText.split(";");

            if (fields.length < 3) {
                return LocalDate.now();
            }

            // [2] 필드 앞 8자리가 교부일자 형태로 보임
            String decodedNumber = decodeNumberKeepOnlyDigits(fields[2]);

            if (decodedNumber.length() < 8) {
                return LocalDate.now();
            }

            String dateText = decodedNumber.substring(0, 8);

            int year = Integer.parseInt(dateText.substring(0, 4));
            int month = Integer.parseInt(dateText.substring(4, 6));
            int day = Integer.parseInt(dateText.substring(6, 8));

            return LocalDate.of(year, month, day);

        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private String decodeNumberKeepOnlyDigits(String encoded) {
        StringBuilder result = new StringBuilder();

        for (char ch : encoded.toCharArray()) {
            Character digit = decodeDigitChar(ch);

            if (digit != null) {
                result.append(digit);
            } else if (Character.isDigit(ch)) {
                result.append(ch);
            }
        }

        return result.toString();
    }
}