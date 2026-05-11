package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.web.dto.ScheduleCreateRequest;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.domain.Schedule;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.ScheduleRepository;
import hiddencore.ddasum.backend.web.dto.PostDto;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용, 쓰기 메서드에만 @Transactional 별도 선언
public class PostService {

    private final PostRepository postRepository;
    private final FacilityRepository facilityRepository;
    private final MemberRepository memberRepository;
    private final ScheduleService scheduleService;
    private final ScheduleRepository scheduleRepository;

    /* 게시판 조회 */

    // 전체 목록 조회: type 없으면 전체, 있으면 해당 타입만
    public List<PostDto.PostListResponse> getPostList(Long facilityId, PostType type, Pageable pageable) {
        List<Post> posts = (type == null)
                ? postRepository.findAllByFacility(facilityId, pageable)
                : postRepository.findAllByFacilityAndType(facilityId, type, pageable);

        return toPostListResponses(facilityId, posts);
    }

    // 단건 상세 조회
    // CHECK!!! 추후 중복 조회수 방지 로직 추가 필요 (userId 기반 또는 세션 기반)
    @Transactional
    public PostDto.PostResponse getPost(Long facilityId, Long postId) {
        Post post = postRepository.findByPostIdAndFacilityId(postId, facilityId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        // 공개 게시글만 조회수 증가 (임시저장·비공개 조회는 제외)
        if (post.getStatus() == PostStatus.ACTIVE || post.getStatus() == PostStatus.RESERVE) {
            post.incrementViews();
        }
        return PostDto.PostResponse.from(post);
    }

    // 검색: searchType = title | content | all
    // CHECK!!! 프론트 필터링으로 대체 예정 - 현재는 미사용이나 엔드포인트 유지
    public List<PostDto.PostListResponse> searchPost(Long facilityId, PostType type,
            String searchType, String keyword, Pageable pageable) {
        if (!List.of("title", "content", "all").contains(searchType)) {
            throw new IllegalArgumentException("잘못된 검색 타입입니다. (title | content | all)");
        }

        // type이 null이면 전체 타입을 각각 조회해서 합침
        List<Post> posts;
        if (type == null) {
            posts = Stream.of(PostType.values())
                    .flatMap(
                            t -> postRepository.searchInFacility(facilityId, t, searchType, keyword, pageable).stream())
                    .toList();
        } else {
            posts = postRepository.searchInFacility(facilityId, type, searchType, keyword, pageable);
        }

        return toPostListResponses(facilityId, posts);
    }

    /* 게시글 CRUD */

    // 게시글 생성
    @Transactional
    public PostDto.PostResponse createPost(Long facilityId, Long userId, PostDto.CreateRequest request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new IllegalArgumentException("시설을 찾을 수 없습니다."));
        Users author = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 프로그램 게시판 타입(APPLY, REVIEW)일 때만 currentEnrolled 0으로 초기화, 나머지는 null
        Integer currentEnrolled = (request.getType() == PostType.APPLY
                || request.getType() == PostType.REVIEW) ? 0 : null;

        Post post = Post.builder()
                .facilityId(facility)
                .authorUserId(author)
                .type(request.getType())
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .targetRoles(request.getTargetRoles())
                .title(request.getTitle())
                .content(request.getContent())
                .status(request.getStatus())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .capacity(request.getCapacity())
                .currentEnrolled(currentEnrolled)
                .attachmentUrls(request.getAttachmentUrls())
                .reservationAt(request.getReservationAt())
                .build();

        // Schedule 저장 (날짜 있을 때만)
        if (request.getScheduledAt() != null) {
            ScheduleType scheduleType = (request.getType() == PostType.APPLY || request.getType() == PostType.REVIEW)
                    ? ScheduleType.PROGRAM
                    : ScheduleType.FACILITY;

            ScheduleCreateRequest scheduleRequest = new ScheduleCreateRequest();
            scheduleRequest.setFacilityId(facilityId);
            scheduleRequest.setTitle(request.getTitle());
            scheduleRequest.setContent(request.getContent());
            scheduleRequest.setScheduledAt(request.getScheduledAt());
            scheduleRequest.setEndAt(request.getScheduleEndAt());

            scheduleService.createFacilitySchedule(scheduleRequest, userId, scheduleType);
        }

        return PostDto.PostResponse.from(postRepository.save(post));
    }

    // 게시글 수정: 작성자 본인만 가능
    @Transactional
    public PostDto.PostResponse updatePost(Long facilityId, Long postId, Long userId,
            PostDto.UpdateRequest request) {
        Post post = postRepository.findByPostIdAndFacilityId(postId, facilityId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthorUserId().getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // 공통 필드
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // PROGRAM 전용 필드: null이면 기존 값 유지
        if (request.getIsPinned() != null)
            post.setIsPinned(request.getIsPinned());
        if (request.getTargetRoles() != null)
            post.setTargetRoles(request.getTargetRoles());
        if (request.getStatus() != null)
            post.setStatus(request.getStatus());
        if (request.getStartAt() != null)
            post.setStartAt(request.getStartAt());
        if (request.getEndAt() != null)
            post.setEndAt(request.getEndAt());
        if (request.getCapacity() != null)
            post.setCapacity(request.getCapacity());
        if (request.getAttachmentUrls() != null)
            post.setAttachmentUrls(request.getAttachmentUrls());
        if (request.getReservationAt() != null)
            post.setReservationAt(request.getReservationAt());

        // @Transactional 안에서 변경하면 save() 없이 dirty checking으로 자동 반영됨
        return PostDto.PostResponse.from(post);
    }

    // // 게시글 삭제: 소프트 삭제 (INACTIVE로 상태 변경)
    // @Transactional
    // public void deletePost(Long facilityId, Long postId, Long userId) {
    // Post post = postRepository.findByIdInFacility(postId, facilityId)
    // .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

    // if (!post.getAuthorUserId().getUserId().equals(userId)) {
    // throw new IllegalArgumentException("삭제 권한이 없습니다.");
    // }

    // // 물리적으로 삭제하지 않고 상태만 변경 (복구 가능성 유지)
    // post.setStatus(PostStatus.INACTIVE);
    // }

    // 게시글 삭제: 하드 삭제 (DB에서 완전 제거)
    @Transactional
    public void deletePost(Long facilityId, Long postId, Long userId) {
        Post post = postRepository.findByPostIdAndFacilityId(postId, facilityId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthorUserId().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        postRepository.delete(post);
    }

    /* 유저 마이페이지 */

    // 작성 기록 조회: type 없으면 전체, 있으면 해당 타입만
    public List<PostDto.PostListResponse> getUserActivePosts(Long userId, PostType type, Pageable pageable) {
        List<Post> posts = (type == null)
                ? postRepository.findActiveByUser(userId, pageable)
                : postRepository.findActiveByUserAndType(userId, type, pageable);

        Long facilityId = posts == null || posts.isEmpty() ? null : posts.get(0).getFacilityId().getFacilityId();
        return toPostListResponses(facilityId, posts);
    }

    // 임시 저장 조회: type 없으면 전체, 있으면 해당 타입만
    public List<PostDto.PostListResponse> getUserDrafts(Long userId, PostType type, Pageable pageable) {
        List<Post> posts = (type == null)
                ? postRepository.findInactiveByUser(userId, pageable)
                : postRepository.findInactiveByUserAndType(userId, type, pageable);

        Long facilityId = posts == null || posts.isEmpty() ? null : posts.get(0).getFacilityId().getFacilityId();
        return toPostListResponses(facilityId, posts);
    }

    private List<PostDto.PostListResponse> toPostListResponses(Long facilityId, List<Post> posts) {
        List<Post> safePosts = Optional.ofNullable(posts).orElse(Collections.emptyList());
        if (safePosts.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Schedule> programSchedules = loadProgramScheduleMap(
                facilityId != null ? facilityId : safePosts.get(0).getFacilityId().getFacilityId(),
                safePosts);

        return safePosts.stream()
                .map(post -> {
                    Schedule schedule = isProgramPost(post)
                            ? programSchedules.get(buildProgramScheduleKey(post.getTitle(), post.getContent()))
                            : null;
                    return PostDto.PostListResponse.from(
                            post,
                            schedule != null ? schedule.getScheduledAt() : null,
                            schedule != null ? schedule.getEndAt() : null);
                })
                .toList();
    }

    private Map<String, Schedule> loadProgramScheduleMap(Long facilityId, List<Post> posts) {
        if (facilityId == null || posts.stream().noneMatch(this::isProgramPost)) {
            return Collections.emptyMap();
        }

        Map<String, Schedule> scheduleMap = new HashMap<>();
        List<Schedule> schedules = scheduleRepository.findByFacilityId_FacilityIdAndTypeOrderByCreatedAtDesc(
                facilityId,
                ScheduleType.PROGRAM);

        for (Schedule schedule : schedules) {
            scheduleMap.putIfAbsent(buildProgramScheduleKey(schedule.getTitle(), schedule.getContent()), schedule);
        }

        return scheduleMap;
    }

    private boolean isProgramPost(Post post) {
        return post.getType() == PostType.APPLY || post.getType() == PostType.REVIEW;
    }

    private String buildProgramScheduleKey(String title, String content) {
        return normalizeKeyPart(title) + "::" + normalizeKeyPart(content);
    }

    private String normalizeKeyPart(String value) {
        return value == null ? "" : value.trim();
    }
}