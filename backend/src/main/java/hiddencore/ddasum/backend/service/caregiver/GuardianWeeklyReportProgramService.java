package hiddencore.ddasum.backend.service.caregiver;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.repository.ScheduleRepository;
import hiddencore.ddasum.backend.web.dto.care.GuardianWeeklyCareReportResponse;
import lombok.RequiredArgsConstructor;

/**
 * 보호자 주간 보고서 — 신청 가능(모집 중·미신청·정원 여유) 프로그램 목록 조회.
 * 프로그램 신청 화면의 신청하기 활성 조건과 동일하되, 추천 후보는 {@code 모집 중}만 포함한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianWeeklyReportProgramService {

    private final PostRepository postRepository;
    private final ScheduleRepository scheduleRepository;
    private final DocumentRepository documentRepository;

    public List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> listApplyEligiblePrograms(
            Long facilityId,
            Long guardianUserId,
            LocalDate reportPeriodEnd) {
        if (facilityId == null) {
            return List.of();
        }

        LocalDate nextWeekStart = reportPeriodEnd.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        LocalDateTime now = LocalDateTime.now();
        Set<Long> appliedPostIds = loadAppliedPostIds(guardianUserId);
        Map<String, Schedule> scheduleMap = loadProgramScheduleMap(facilityId);

        List<Post> posts =
                postRepository.findAllByFacilityAndType(
                        facilityId, PostType.APPLY, PageRequest.of(0, 200));

        List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> result = new ArrayList<>();
        for (Post post : posts) {
            if (post.getStatus() != PostStatus.ACTIVE) {
                continue;
            }
            if (post.getStartAt() == null || post.getEndAt() == null) {
                continue;
            }
            if (now.isBefore(post.getStartAt()) || now.isAfter(post.getEndAt())) {
                continue;
            }

            int capacity = post.getCapacity() != null ? post.getCapacity() : 0;
            int enrolled = post.getCurrentEnrolled() != null ? post.getCurrentEnrolled() : 0;
            if (capacity > 0 && enrolled >= capacity) {
                continue;
            }
            if (appliedPostIds.contains(post.getPostId())) {
                continue;
            }

            Schedule schedule = scheduleMap.get(buildProgramScheduleKey(post.getTitle(), post.getContent()));
            LocalDateTime programStart = schedule != null ? schedule.getScheduledAt() : null;
            if (programStart != null && programStart.toLocalDate().isBefore(nextWeekStart)) {
                continue;
            }

            String category = inferCategory(post.getTitle(), post.getContent());
            result.add(
                    GuardianWeeklyCareReportResponse.ApplyEligibleProgram.builder()
                            .postId(post.getPostId())
                            .title(post.getTitle())
                            .description(trimDescription(post.getContent()))
                            .category(category)
                            .recruitStatus("모집 중")
                            .capacity(capacity > 0 ? capacity : null)
                            .currentEnrolled(enrolled)
                            .programStartAt(programStart)
                            .recruitEndAt(post.getEndAt())
                            .build());
        }
        return result;
    }

    public static LocalDate resolveNextWeekStart(LocalDate reportPeriodEnd) {
        if (reportPeriodEnd == null) {
            return LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        }
        return reportPeriodEnd.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    }

    static String inferCategory(String title, String content) {
        String text = ((title != null ? title : "") + " " + (content != null ? content : "")).toLowerCase();
        if (containsAny(
                text,
                "인지",
                "치매",
                "보드게임",
                "퀴즈",
                "기억",
                "추억",
                "앨범",
                "숫자",
                "카드",
                "순서")) {
            return "인지 강화";
        }
        if (containsAny(text, "음악", "노래", "악기")) {
            return "음악 치료";
        }
        if (containsAny(text, "체조", "레크리에이션", "운동", "스트레칭", "걷기", "신체")) {
            return "신체 활동";
        }
        if (containsAny(text, "가드닝", "원예", "식물", "화분")) {
            return "원예 활동";
        }
        if (containsAny(text, "미술", "색칠", "만들기", "창작", "그리기")) {
            return "미술·창작";
        }
        if (containsAny(text, "요리", "음식", "식사")) {
            return "식생활·요리";
        }
        return "기타 프로그램";
    }

    private Set<Long> loadAppliedPostIds(Long guardianUserId) {
        Set<Long> ids = new HashSet<>();
        if (guardianUserId == null) {
            return ids;
        }
        documentRepository
                .findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
                        guardianUserId, DocumentType.PROGRAM_APPLICATION)
                .stream()
                .filter(
                        d ->
                                d.getStatus() == DocumentStatus.PENDING_APPROVAL
                                        || d.getStatus() == DocumentStatus.APPROVED)
                .filter(d -> d.getPostId() != null)
                .forEach(d -> ids.add(d.getPostId().getPostId()));
        return ids;
    }

    private Map<String, Schedule> loadProgramScheduleMap(Long facilityId) {
        Map<String, Schedule> scheduleMap = new HashMap<>();
        for (Schedule schedule :
                scheduleRepository.findByFacilityId_FacilityIdAndTypeOrderByCreatedAtDesc(
                        facilityId, ScheduleType.PROGRAM)) {
            scheduleMap.putIfAbsent(
                    buildProgramScheduleKey(schedule.getTitle(), schedule.getContent()), schedule);
        }
        return scheduleMap;
    }

    private static String buildProgramScheduleKey(String title, String content) {
        return normalizeKeyPart(title) + "::" + normalizeKeyPart(content);
    }

    private static String normalizeKeyPart(String value) {
        return value == null ? "" : value.trim();
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private static String trimDescription(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }
        String trimmed = content.trim().replaceAll("\\s+", " ");
        return trimmed.length() > 200 ? trimmed.substring(0, 200) + "…" : trimmed;
    }
}
