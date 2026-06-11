package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.util.AppDateTimes;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostPublishScheduler {

    private final PostRepository postRepository;
    private final TaskScheduler taskScheduler;

    // 중복 등록 방지: postId → 예약된 Future
    private final ConcurrentHashMap<Long, ScheduledFuture<?>> pendingTasks = new ConcurrentHashMap<>();

    /** 서버 재시작 시 미발행 예약 게시글을 다시 스케줄링 */
    @PostConstruct
    public void restoreOnStartup() {
        List<Post> pending = postRepository.findPendingReservedPosts(AppDateTimes.now());
        pending.forEach(post -> schedule(post.getPostId(), post.getReservationAt()));
        if (!pending.isEmpty()) {
            log.info("[PostPublish] 서버 재시작 - {}건 예약 복원", pending.size());
        }
    }

    /** 게시글 생성/수정 시 외부에서 호출 */
    public void schedule(Long postId, LocalDateTime reservationAt) {
        if (postId == null || reservationAt == null) return;

        // 이미 등록된 예약이 있으면 취소 후 재등록
        ScheduledFuture<?> existing = pendingTasks.remove(postId);
        if (existing != null) existing.cancel(false);

        Instant fireAt = AppDateTimes.toInstant(reservationAt);
        if (fireAt == null) return;
        ScheduledFuture<?> future = taskScheduler.schedule(
                () -> publish(postId),
                Objects.requireNonNull(fireAt)
        );
        pendingTasks.put(postId, future);
        log.info("[PostPublish] 게시글 {} 예약 등록 → {}", postId, reservationAt);
    }

    /** 예약 취소 (삭제 시 호출) */
    public void cancel(Long postId) {
        ScheduledFuture<?> future = pendingTasks.remove(postId);
        if (future != null) future.cancel(false);
    }

    @Transactional
    public void publish(Long postId) {
        if (postId == null) return;
        postRepository.findById(postId).ifPresent(post -> {
            if (post.getStatus() == PostStatus.RESERVE) {
                post.setStatus(PostStatus.ACTIVE);
                postRepository.save(post);
                log.info("[PostPublish] 게시글 {} 자동 발행 완료", postId);
            }
        });
        pendingTasks.remove(postId);
    }
}
