import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import postApi from '../api/postApi';
import { PAGE_SIZE, BOARD_OPTIONS, BOARD_TYPE_MAP } from '../utils/boardUtils';

// 날짜 문자열 → ms (안전하게)
const toMs = (v) => (v ? new Date(v).getTime() || 0 : 0);

const BoardContext = createContext(null);

/** 목록 API 필드 정규화 (0명 신청도 숫자로 유지 — truthy 체크 시 '-' 로 보이던 문제 방지) */
const normalizeProgramPostFields = (post) => {
  if (!post || typeof post !== 'object') return post;
  const rawEnrolled = post.currentEnrolled ?? post.current_enrolled;
  const rawCapacity = post.capacity;
  return {
    ...post,
    capacity: rawCapacity == null || rawCapacity === '' ? null : Number(rawCapacity),
    currentEnrolled:
      rawEnrolled == null || rawEnrolled === '' ? null : Number(rawEnrolled),
  };
};

/**
 * BoardContext 훅
 * BoardProvider 외부에서 호출하면 에러를 던져 잘못된 사용을 방지
 */
export const useBoardContext = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext는 BoardProvider 안에서만 사용할 수 있습니다.');
  return ctx;
};

export const BoardProvider = ({ facilityId, initialBoardValue = 'ALL', children }) => {

  // 원본 전체 데이터 - 마운트 시 1회 로드 후 변경 안 함
  const [allPosts, setAllPosts] = useState([]);
  
  // 드롭다운 선택 상태 (게시판 종류)
  // BOARD_OPTIONS[0] = { label: '전체 게시판', value: 'ALL' }
  const [selectedBoard, setSelectedBoard] = useState(
    BOARD_OPTIONS.find((option) => option.value === initialBoardValue) ?? BOARD_OPTIONS[0]
  );

  // 필터/검색 상태
  const [currentTab, setCurrentTab] = useState(null);   // null = 전체
  const [currentPage, setCurrentPage] = useState(0);    // 0-based
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('all');  // 'title' | 'content' | 'all'
  const [filterType, setFilterType] = useState(null);   // null = 전체 / 'URGENT' / 'ADMIN' / ...
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'views' | 'alpha'

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 전체 게시글 로드
   * 마운트 시 1회 + CRUD 완료 후 재호출
   */
  const fetchAllPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // type=null, size=9999로 전체 데이터 1회 로드
      // 탭/검색/페이지네이션은 모두 프론트에서 처리
      const res = await postApi.getPostList(facilityId, null, 0, 500);
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];
      setAllPosts(list.map(normalizeProgramPostFields));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  /**
   * 게시판(드롭다운) 변경
   * 탭/검색/필터/페이지 모두 초기화
   */
  const changeBoard = useCallback((option) => {
    setSelectedBoard(option);
    setCurrentTab(null);
    setCurrentPage(0);
    setSearchKeyword('');
    setSearchType('all');
    setFilterType(null);
  }, []);

  /**
   * 탭 변경 — 커스텀 filterType 초기화
   */
  const changeTab = useCallback((type) => {
    setCurrentTab(type);
    setFilterType(null);
    setCurrentPage(0);
    setSearchKeyword('');
  }, []);

  /** 타입 필터 변경 (null = 전체) — 선택 시 탭 초기화 */
  const changeFilter = useCallback((type) => {
    setFilterType(type);
    if (type !== null) setCurrentTab(null);
    setCurrentPage(0);
  }, []);

  /** 정렬 변경 */
  const changeSort = useCallback((order) => {
    setSortOrder(order);
    setCurrentPage(0);
  }, []);

  /**
   * 검색 실행
   * 페이지를 0으로 초기화
   */
  const search = useCallback((type, keyword) => {
    setSearchType(type);
    setSearchKeyword(keyword);
    setCurrentPage(0);
  }, []);

  /** 검색 초기화 */
  const resetSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchType('all');
    setCurrentPage(0);
  }, []);

  /**
   * 탭 + 검색 + 필터 + 정렬 적용 게시글 목록
   */
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    // 1단계: 게시판 필터 (ALL이면 전체)
    if (selectedBoard.value !== 'ALL') {
      const types = BOARD_TYPE_MAP[selectedBoard.value] ?? [];
      result = result.filter((post) => types.includes(post.type));
    }

    // 2단계: 타입 필터 — filterType 우선, 없으면 currentTab
    const activeType = filterType ?? currentTab;
    if (activeType) {
      result = result.filter((post) => post.type === activeType);
    }

    // 3단계: 검색 필터
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((post) => {
        const inTitle = post.title?.toLowerCase().includes(keyword);
        const inContent = post.content?.toLowerCase().includes(keyword);
        if (searchType === 'title') return inTitle;
        if (searchType === 'content') return inContent;
        return inTitle || inContent;
      });
    }

    // 4단계: 정렬 (isPinned 항상 최상단 유지)
    const sorted = [...result];
    sorted.sort((a, b) => {
      const pinnedDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      if (pinnedDiff !== 0) return pinnedDiff;

      switch (sortOrder) {
        case 'oldest':
          return toMs(a.createdAt ?? a.updatedAt) - toMs(b.createdAt ?? b.updatedAt);
        case 'views':
          return (b.views ?? b.viewCount ?? 0) - (a.views ?? a.viewCount ?? 0);
        case 'alpha':
          return (a.title ?? '').localeCompare(b.title ?? '', 'ko');
        default: // 'newest'
          return toMs(b.updatedAt ?? b.createdAt) - toMs(a.updatedAt ?? a.createdAt);
      }
    });
    return sorted;
  }, [allPosts, selectedBoard, currentTab, searchKeyword, searchType, filterType, sortOrder]);

  /** 전체 페이지 수 */
  const totalPages = useMemo(
    () => Math.ceil(filteredPosts.length / PAGE_SIZE),
    [filteredPosts]
  );

  /** 현재 페이지에 해당하는 게시글 목록 */
  const paginatedPosts = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  const value = {
    // 상태
    allPosts,
    selectedBoard,
    currentTab,
    currentPage,
    searchKeyword,
    searchType,
    filterType,
    sortOrder,
    isLoading,
    error,
    // 파생 상태
    filteredPosts,
    totalPages,
    paginatedPosts,
    // 액션
    fetchAllPosts,
    changeBoard,
    changeTab,
    changePage: setCurrentPage,
    search,
    resetSearch,
    changeFilter,
    changeSort,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
