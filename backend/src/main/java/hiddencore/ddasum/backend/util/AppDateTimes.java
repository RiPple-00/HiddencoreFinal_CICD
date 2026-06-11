package hiddencore.ddasum.backend.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** 앱 기준 시간대(KST) — 예약 게시 등 wall-clock LocalDateTime 처리 */
public final class AppDateTimes {

    public static final ZoneId ZONE = ZoneId.of("Asia/Seoul");

    private AppDateTimes() {
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE);
    }

    public static Instant toInstant(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(ZONE).toInstant();
    }
}
