package hiddencore.ddasum.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.repository.ScheduleRepository;

/**
 * 프로그램 게시판(APPLY) 모집 현황 더미 — 기동 시 기존 글도 보강 (SQL 미실행 환경 대비).
 */
@Configuration
public class ProgramRecruitmentSeeder {

    private static final String DEMO_FACILITY_CODE = "12345678";

    @Bean
    @Order(4)
    CommandLineRunner seedProgramRecruitment(
            FacilityRepository facilityRepository,
            MemberRepository memberRepository,
            PostRepository postRepository,
            ScheduleRepository scheduleRepository) {
        return args -> {
            Facility facility = facilityRepository.findByFacilityCode(DEMO_FACILITY_CODE).orElse(null);
            if (facility == null) {
                facility = facilityRepository.findAll().stream().findFirst().orElse(null);
            }
            if (facility == null) {
                return;
            }

            Users author = memberRepository.findAll().stream()
                    .filter(u -> u.getRole() == Users.UsersRole.OFFICE)
                    .findFirst()
                    .orElseGet(() -> memberRepository.findAll().stream().findFirst().orElse(null));
            if (author == null) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            Pageable all = PageRequest.of(0, 500);

            List<Post> applyPosts = postRepository.findAllByFacilityAndType(
                    facility.getFacilityId(), PostType.APPLY, all);

            int[][] quota = {{20, 14}, {15, 9}, {18, 12}, {10, 7}, {30, 3}};
            for (int i = 0; i < applyPosts.size(); i++) {
                Post p = applyPosts.get(i);
                int cap = quota[i % quota.length][0];
                int enrolled = quota[i % quota.length][1];
                // 데모: 모집 현황·기간이 비어 있거나 신청 0명이면 매 기동 시 보강
                boolean needsPatch = p.getCapacity() == null
                        || p.getStartAt() == null
                        || p.getEndAt() == null
                        || p.getCurrentEnrolled() == null
                        || p.getCurrentEnrolled() <= 0;

                if (needsPatch) {
                    p.setCapacity(cap);
                    p.setCurrentEnrolled(enrolled);
                    if (i % 3 == 0) {
                        p.setStartAt(now.minusDays(5));
                        p.setEndAt(now.plusDays(20));
                    } else if (i % 3 == 1) {
                        p.setStartAt(now.plusDays(10));
                        p.setEndAt(now.plusDays(35));
                    } else {
                        p.setStartAt(now.minusDays(45));
                        p.setEndAt(now.minusDays(10));
                    }
                    if (p.getStatus() == null) {
                        p.setStatus(PostStatus.ACTIVE);
                    }
                    postRepository.save(p);
                    ensureProgramSchedule(scheduleRepository, facility, author, p, now);
                }
            }

            if (applyPosts.size() < 4) {
                insertIfAbsent(postRepository, scheduleRepository, facility, author, now,
                        "6월 음악 치료 프로그램",
                        "어르신 인지·정서 안정을 위한 음악 치료입니다.",
                        18, 12, now.minusDays(7), now.plusDays(14));
                insertIfAbsent(postRepository, scheduleRepository, facility, author, now,
                        "7월 레크리에이션 체조",
                        "전 신체 가벼운 체조와 게임을 함께합니다.",
                        30, 3, now.plusDays(10), now.plusDays(35));
                insertIfAbsent(postRepository, scheduleRepository, facility, author, now,
                        "인지 강화 보드게임 모임",
                        "치매 예방 보드게임 프로그램 (소규모 10명).",
                        10, 7, now.minusDays(1), now.plusDays(21));
            }

            // 보호자 주간보고서 AI·fallback 추천용 인지 프로그램 (항상 보강)
            insertIfAbsent(postRepository, scheduleRepository, facility, author, now,
                    "나만의 추억 앨범 만들기",
                    "알츠하이머·치매 환자 대상 추억 회상·앨범 제작 인지 프로그램.",
                    12, 5, now.minusDays(2), now.plusDays(28));
            insertIfAbsent(postRepository, scheduleRepository, facility, author, now,
                    "숫자 카드 순서 맞추기",
                    "경도 인지 저하 환자를 위한 순서·기억 훈련 프로그램.",
                    10, 4, now.minusDays(1), now.plusDays(25));
        };
    }

    private static void insertIfAbsent(
            PostRepository postRepository,
            ScheduleRepository scheduleRepository,
            Facility facility,
            Users author,
            LocalDateTime now,
            String title,
            String content,
            int capacity,
            int enrolled,
            LocalDateTime recruitStart,
            LocalDateTime recruitEnd) {
        boolean exists = postRepository.findAllByFacility(facility.getFacilityId(), PageRequest.of(0, 500))
                .stream()
                .anyMatch(p -> title.equals(p.getTitle()) && p.getType() == PostType.APPLY);
        if (exists) {
            return;
        }
        Post post = postRepository.save(Post.builder()
                .facilityId(facility)
                .authorUserId(author)
                .type(PostType.APPLY)
                .title(title)
                .content(content)
                .status(PostStatus.ACTIVE)
                .isPinned(false)
                .targetRoles("OFFICE,CAREGIVER")
                .views(20)
                .startAt(recruitStart)
                .endAt(recruitEnd)
                .capacity(capacity)
                .currentEnrolled(enrolled)
                .build());
        ensureProgramSchedule(scheduleRepository, facility, author, post, now);
    }

    private static void ensureProgramSchedule(
            ScheduleRepository scheduleRepository,
            Facility facility,
            Users author,
            Post post,
            LocalDateTime now) {
        LocalDateTime eventStart = post.getEndAt() != null
                ? post.getEndAt().plusDays(3).withHour(14).withMinute(0).withSecond(0).withNano(0)
                : now.plusDays(7);
        LocalDateTime eventEnd = eventStart.plusHours(2);

        boolean hasSchedule = scheduleRepository
                .findByFacilityId_FacilityIdAndTypeOrderByCreatedAtDesc(
                        facility.getFacilityId(), ScheduleType.PROGRAM)
                .stream()
                .anyMatch(s -> post.getTitle().equals(s.getTitle()));

        if (!hasSchedule) {
            scheduleRepository.save(Schedule.builder()
                    .facilityId(facility)
                    .createdUserId(author)
                    .title(post.getTitle())
                    .content(post.getContent())
                    .type(ScheduleType.PROGRAM)
                    .scheduledAt(eventStart)
                    .endAt(eventEnd)
                    .build());
        }
    }
}
