package hiddencore.ddasum.backend.config;

/** 프로그램 게시판(APPLY) 시연용 모집 현황 규칙 */
public final class ProgramDemoConstants {

    public static final int DEFAULT_CAPACITY = 12;
    public static final int DEFAULT_ENROLLED = 0;

    private ProgramDemoConstants() {}

    /** 신청관리·더미 신청을 유지하는 대표 프로그램 */
    public static boolean isOrigamiProgram(String title) {
        return title != null && title.contains("종이접기");
    }
}
