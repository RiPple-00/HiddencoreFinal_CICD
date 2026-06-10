package hiddencore.ddasum.backend.config;

/** 시연 공통 환자 상수 — AiDemoPatientsSeeder·보호자/요양사 앱과 동일 */
public final class DemoPatientConstants {

    public static final long KIM_PATIENT_ID = 260401008L;
    public static final String KIM_PATIENT_NAME = "기만경";

    public static final String KIM_DIAGNOSIS_TITLE =
            "알츠하이머형 치매, 경도 단계\nMild Alzheimer's Dementia";

    public static final String KIM_DIAGNOSIS_COMMENT =
            "최근 기억력 저하가 주된 양상으로 관찰되며, 특히 최근 대화 내용이나 식사 여부, 약 복용 여부에 대한 회상이 불안정합니다. "
                    + "과거 기억과 기본적인 의사소통 능력은 비교적 유지되고 있으나, 시간 지남력 저하와 반복 질문이 동반됩니다. "
                    + "현재 상태에서는 일상생활 전반의 독립성은 일부 유지되나, 복약 관리 및 일정 확인에는 보호자 또는 요양 인력의 보조가 필요합니다.";

    private DemoPatientConstants() {}
}
