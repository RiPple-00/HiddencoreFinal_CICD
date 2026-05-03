package hiddencore.ddasum.backend.security;

/**
 * 직원은 DB에서 전역 유일한 {@code login_id}로 저장하고, 로그인 시에는 시설코드 + 10자리 직원 ID로 조회한다.
 */
public final class StaffLoginIdCodec {

    private static final char SEP = '|';

    private StaffLoginIdCodec() {}

    public static String encode(String facilityCode, String employeeLoginId) {
        return facilityCode + SEP + employeeLoginId;
    }

    public static boolean isStaffLoginId(String loginId) {
        return loginId != null && loginId.length() > 10 && loginId.indexOf(SEP) == 8;
    }
}
