# 📋 게시판 (Board) 프론트엔드 구조 문서 - UPDATEAT 04.11 16:41

> - Nav 바는 외부 컴포넌트 사용 예정으로 제외
> - 탭 전환 / 검색 / 페이지네이션 모두 프론트엔드에서 처리
> - 백엔드 추가 호출 없음 (마운트 시 1회 전체 로드)
> - 환경: Java(Spring Boot) + JavaScript + React + Tailwind + Express + Axios + Swagger

---

## 📁 디렉토리 구조

```
src/
├── utils/
│   ├── boardUtils.js               # 상수 + 유틸 함수
│   └── dateUtils.js                # 날짜 포맷 유틸
│
├── api/
│   └── postApi.js                  # Axios 기반 API 호출
│
├── contexts/
│   └── BoardContext.jsx            # 게시판 상태/로직 중앙 관리
│
├── components/
│   ├── common/
│   │   ├── StatusBadge.jsx         # 공통 배지 (게시판 외 전체 사용 가능)
│   │   ├── FilterTab.jsx           # 공통 탭 (탭 목록 props 주입)
│   │   ├── SearchBar.jsx           # 공통 검색바
│   │   └── Pagination.jsx          # 공통 페이지네이션
│   │
│   └── board/
│       ├── PostList.jsx            # 게시글 목록 (table / widget 모드 공용)
│       ├── BoardWidget.jsx         # 메인 페이지 위젯
│       ├── create/
│       │    ├── CreateSidebar.jsx   # 좌측 사이드바
│       │    ├── CreateForm.jsx      # 중앙 본문 (공통)
│       │    ├── FileUpload.jsx      # 첨부파일 업로드
│       │    └── panel/
│       │        ├── PanelBase.jsx   # 패널 공통 영역 (PanelHeader + PanelActions)
│       │        ├── NoticePanel.jsx # 우측 패널 - 공지 전용
│       │        ├── ProgramPanel.jsx# 우측 패널 - 프로그램 전용
│       │        └── PostPanel.jsx   # 우측 패널 - 일반 (❌CHECK!!! 아직 주석처리 -> 디자인 후 확정)
│       └── detail/
│           ├── DetailActionBar.jsx      ✅ 완료 (Button 적용)
│           └── AttachmentList.jsx       ✅ 완료 (Button 적용)
│
└── pages/
    └── board/
        ├── BoardListPage.jsx
        ├── BoardDetailPage.jsx     
        ├── BoardCreatePage.jsx
        ├── BoardEditPage.jsx       #❌ CHECK!!! 미작성
        ├── BoardHistoryPage.jsx    #❌ CHECK!!! 미작성
        └── BoardDraftPage.jsx      #❌ CHECK!!! 미작성
```

---

## 🗂️ boardUtils.js 상수 구조

### 게시판 구조

| 드롭다운 | 탭 | PostType 묶음 |
|---------|-----|--------------|
| 전체 게시판 (ALL) | 탭 없음 | - |
| 공지 게시판 (NOTICE) | 전체/긴급/임상/행정/시설 | URGENT, CLINICAL, ADMIN, FACILITY |
| 프로그램 게시판 (PROGRAM) | 전체/참여신청/활동후기 | APPLY, REVIEW |
| 자유 게시판 (GENERAL) | 탭 없음 | GENERAL |

### Post 도메인 PostType enum 대응

| PostType | 게시판 | 탭 라벨 | 배지 |
|----------|--------|---------|------|
| URGENT | 공지 | 긴급 공지 | 빨강 |
| CLINICAL | 공지 | 임상 가이드라인 | 초록 |
| ADMIN | 공지 | 행정 소식 | 회색 |
| FACILITY | 공지 | 시설 공지 | 주황 |
| APPLY | 프로그램 | 참여 신청 | 파랑 |
| REVIEW | 프로그램 | 활동 후기 | 노랑 |
| GENERAL | 자유 | - | 회색(연) |

### Post 도메인 PostStatus enum 대응

| PostStatus | UI 표시 | 발생 시점 |
|------------|---------|-----------|
| ACTIVE | 게시 중 | 즉시 게시 등록 시 |
| INACTIVE | 보관 중 | 임시 저장 시 |
| RESERVE | 예약 중 | 예약 게시 등록 시 |

### targetRoles 처리
```
UI:  배열 ['DOCTOR', 'CAREGIVER']
API: 문자열 "DOCTOR,CAREGIVER" → stringifyTargetRoles()
```
 
### attachmentUrls 처리
```
UI:  배열 ['https://...']
API: JSON 문자열 → stringifyAttachmentUrls()
조회: JSON 파싱 → parseAttachmentUrls()
```
 
---

## 🔄 데이터 흐름

```
마운트 시 1회
getPostList(facilityId, type=null, size=9999)
                ↓
        allPosts 저장 (원본)
                ↓
드롭다운 변경 → BOARD_TYPE_MAP으로 게시판 필터링
탭 변경 → type 기준 필터링
검색어 입력 → title / content / all 기준 필터링
                ↓
        filteredPosts (useMemo)
                ↓
페이지네이션 → slice(page * PAGE_SIZE, (page+1) * PAGE_SIZE)
                ↓
        paginatedPosts (useMemo)
                ↓
PostList 렌더링

CRUD 완료 후 fetchAllPosts() 재호출 → allPosts 갱신
```

---
## 📄 페이지별 구성
 
### BoardListPage
```
드롭다운 (게시판 선택) + Button (새 게시물 작성)
FilterTab (게시판별 탭 - ALL/GENERAL은 탭 없음)
PostList (mode="table")
Pagination
SearchBar (Input + Button 적용)
```
 
### BoardDetailPage
```
DetailActionBar (고정) - Button 4개 (목록/수정/삭제/신청하기)
브레드크럼 + 제목 + 모집상태배지 + 작성자/날짜/조회수
AI 요약 토글 (아직 준비되지 않았습니다.)
본문 (plain text, CHECK!!! HTML이면 dangerouslySetInnerHTML 필요)
AttachmentList - Button (다운로드)
```
 
### BoardWidget (메인 페이지용)
```jsx
<BoardWidget title="공지사항" boardType="NOTICE" facilityId={facilityId} />
<BoardWidget title="프로그램" boardType="PROGRAM" facilityId={facilityId} />
<BoardWidget title="최근 게시물" boardType={null} facilityId={facilityId} />
```
---

## 📄 BoardCreatePage

### URL
```
CreateSidebar (공지/프로그램/게시글 타입 선택 + 작성이력/보관함)
CreateForm (Input 제목 + textarea 본문 + FileUpload)
NoticePanel or ProgramPanel (타입에 따라 교체)
  └── PanelHeader (상단고정 토글 + 게시상태)
  └── 타입별 전용 영역
  └── PanelMeta (작성자/수정일)
  └── PanelActions (Button 3개 - 임시저장/등록/취소)
```

### 타입 선택 (URL 변경 없이 서식만 전환)
| 버튼 | 우측 패널 |
|------|-----------|
| 공지사항 작성 | NoticePanel |
| 프로그램 작성 | ProgramPanel |
| ~~게시글 작성~~ | 주석 처리 |

### 패널별 구성

| 항목 | 공통 | 공지 전용 | 프로그램 전용 |
|------|------|----------|-------------|
| 상단 고정 토글 | ✅ | | |
| 게시 상태 (즉시/예약) | ✅ | | |
| 예약 일시 (reservationAt) | ✅ | | |
| 작성자 / 마지막 수정 | ✅ | | |
| 임시저장 / 등록 / 취소 | ✅ | | |
| 공개 대상 (targetRoles) | | ✅ | |
| 게시 팁 | | ✅ | |
| 모집 일정 (startAt / endAt) | | | ✅ |
| 정원 (capacity) | | | ✅ |
| 모집 상태 미리보기 | | | ✅ |

### PostStatus 변환 규칙
```
임시 저장     → INACTIVE
즉시 게시     → ACTIVE
예약 게시     → RESERVE (reservationAt 값 포함)
```

### targetRoles 처리
```
UI:  배열 ['DOCTOR', 'CAREGIVER']
API: 문자열 "DOCTOR,CAREGIVER"  (stringifyTargetRoles() 사용)
```

### attachmentUrls 처리
```
UI:  배열 ['https://...', 'https://...']
API: JSON 문자열 (stringifyAttachmentUrls() 사용)
```

---
 
## 🔗 API 연결 요약
 
| 기능 | 엔드포인트 | 호출 시점 |
|------|-----------|-----------|
| 전체 목록 | GET `/facilities/:id/posts?size=9999` | 마운트 1회 + CRUD 후 재호출 |
| 단건 상세 | GET `/facilities/:id/posts/:postId` | 상세 페이지 진입 (조회수 자동 증가) |
| 게시글 생성 | POST `/facilities/:id/posts?userId=` | 작성 완료 / 임시저장 |
| 게시글 수정 | PUT `/facilities/:id/posts/:postId?userId=` | 수정 완료 |
| 게시글 삭제 | DELETE `/facilities/:id/posts/:postId?userId=` | 삭제 확인 |
| 내 게시글 | GET `/facilities/:id/posts/my?userId=` | 마이페이지 |
| 임시저장 목록 | GET `/facilities/:id/posts/draft?userId=` | 마이페이지 |
| 파일 업로드 | POST `/facilities/:id/posts/upload` | 파일 선택 즉시 |
| ~~검색~~ | ~~GET `.../posts/search`~~ | 프론트 필터링으로 대체 |
 
---
 
## ⏸ CHECK!!! 미완성 / 확인 필요 항목
 
| 항목 | 위치 | 내용 |
|------|------|------|
| userId 연동 | BoardCreatePage, BoardDetailPage | AuthContext 연동 후 `user?.userId`로 교체 |
| authorName 비교 | DetailActionBar | userId 비교 방식으로 교체 권장 |
| 파일 업로드 API | FileUpload | 백엔드 엔드포인트 구현 후 연결 |
| 파일 저장 위치 | FileUpload | 로컬 / S3 팀 내 확인 필요 |
| content 렌더링 | BoardDetailPage | HTML이면 dangerouslySetInnerHTML 필요 |
| 신청하기 API | DetailActionBar | 엔드포인트 신규 작성 필요 |
| HOT 배지 기준 | boardUtils | 조회수 기준 확정 후 주석 해제 |
| 중복 조회수 방지 | PostService | Security 적용 후 개선 |
| PostPanel | BoardCreatePage | 일반 게시글 확정 후 주석 해제 |
| 작성 권한 | BoardListPage, BoardCreatePage | 역할별 제한 팀원 코드 완료 후 적용 |
 
---
 
## ❌ 미작성 페이지
 
| 페이지 | URL | 비고 |
|--------|-----|------|
| BoardEditPage | `/facilities/:id/board/:postId/edit` | CreatePage 구조 재활용 가능? |
| BoardHistoryPage | `/facilities/:id/board/history` | `getUserActivePosts` API |
| BoardDraftPage | `/facilities/:id/board/draft` | `getUserDrafts` API |
 
---