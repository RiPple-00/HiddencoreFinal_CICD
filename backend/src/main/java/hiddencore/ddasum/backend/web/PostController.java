package hiddencore.ddasum.backend.web;

/*
1. 게시판 전체 조회
2. 게시판 상세 조회(id)
3. 게시판 순서 필터링(params)
-
4. 게시글 생성: 공지, 프로그램, 일반
5. 게시글 수정: 공지, 프로그램, 일반
6. 게시글 삭제: 똑같이? 소프트?
*/

import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.service.PostService;
import hiddencore.ddasum.backend.web.dto.PostDto;
import hiddencore.ddasum.backend.security.AuthenticatedUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/* SWAGGER
 * 전체 페이지
GET /api/facilities/{facilityId}/posts             전체 목록 (type 필터 가능)
GET /api/facilities/{facilityId}/posts/{postId}    단건 상세 (게시글 보기)
GET /api/facilities/{facilityId}/posts/search      검색
POST /api/facilities/{facilityId}/posts            게시글 생성
PUT /api/facilities/{facilityId}/posts/{postId}    게시글 수정
DELETE /api/facilities/{facilityId}/posts/{postId} 게시글 삭제
 * 마이 페이지
GET /api/facilities/{facilityId}/posts/my          내 작성 기록
GET /api/facilities/{facilityId}/posts/draft       내 임시 저장
*/

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/facilities/{facilityId}/posts")
public class PostController {

    private final PostService postService;


    /* 게시판 조회 */

    // 전체 목록 조회: type 없으면 전체, 있으면 해당 타입만
    // GET /facilities/{facilityId}/posts
    // GET /facilities/{facilityId}/posts?type=NOTICE
    @GetMapping
    public ResponseEntity<List<PostDto.PostListResponse>> getPostList(
            @PathVariable Long facilityId,
            @RequestParam(required = false) PostType type,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(postService.getPostList(facilityId, type, pageable));
    }

    // 단건 상세 조회
    // GET /facilities/{facilityId}/posts/{postId}
    @GetMapping("/{postId}")
    public ResponseEntity<PostDto.PostResponse> getPost(
            @PathVariable Long facilityId,
            @PathVariable Long postId) {

        return ResponseEntity.ok(postService.getPost(facilityId, postId));
    }

    // 검색
    // GET /facilities/{facilityId}/posts/search?type=BOARD&searchType=title&keyword=공지
    @GetMapping("/search")
    public ResponseEntity<List<PostDto.PostListResponse>> searchPost(
            @PathVariable Long facilityId,
            @RequestParam(required = false) PostType type,
            @RequestParam String searchType, // title | content | all
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(postService.searchPost(facilityId, type, searchType, keyword, pageable));
    }


    /* 게시글 CRUD */

    // 게시글 생성
    // POST /facilities/{facilityId}/posts?userId={userId}
    @PostMapping
    public ResponseEntity<PostDto.PostResponse> createPost(
            @PathVariable Long facilityId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody @Valid PostDto.CreateRequest request) {
        Long userId = authenticatedUser.userId();
        return ResponseEntity.ok(postService.createPost(facilityId, userId, request));
    }

    // 게시글 수정
    // PUT /facilities/{facilityId}/posts/{postId}?userId={userId}
    @PutMapping("/{postId}")
    public ResponseEntity<PostDto.PostResponse> updatePost(
            @PathVariable Long facilityId,
            @PathVariable Long postId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody @Valid PostDto.UpdateRequest request) {
        Long userId = authenticatedUser.userId();
        return ResponseEntity.ok(postService.updatePost(facilityId, postId, userId, request));
    }

    // 게시글 삭제
    // DELETE /facilities/{facilityId}/posts/{postId}?userId={userId}
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long facilityId,
            @PathVariable Long postId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        Long userId = authenticatedUser.userId();
        postService.deletePost(facilityId, postId, userId);
        return ResponseEntity.noContent().build();
    }


    /* 유저 마이페이지 */

    // 작성 기록 조회
    // GET /facilities/{facilityId}/posts/my?userId={userId}&type=BOARD
    @GetMapping("/my")
    public ResponseEntity<List<PostDto.PostListResponse>> getUserActivePosts(
            @PathVariable Long facilityId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(required = false) PostType type,
            @PageableDefault(size = 20) Pageable pageable) {
        Long userId = authenticatedUser.userId();
        return ResponseEntity.ok(postService.getUserActivePosts(userId, type, pageable));
    }

    // 임시 저장 조회
    // GET /facilities/{facilityId}/posts/draft?userId={userId}&type=BOARD
    @GetMapping("/draft")
    public ResponseEntity<List<PostDto.PostListResponse>> getUserDrafts(
            @PathVariable Long facilityId,
        @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(required = false) PostType type,
            @PageableDefault(size = 20) Pageable pageable) {
        Long userId = authenticatedUser.userId();
        return ResponseEntity.ok(postService.getUserDrafts(userId, type, pageable));
    }
}