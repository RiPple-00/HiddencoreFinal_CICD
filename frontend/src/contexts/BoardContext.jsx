import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import postApi from '../api/postApi';
import { PAGE_SIZE, BOARD_OPTIONS, BOARD_TYPE_MAP } from '../utils/boardUtils';

const BoardContext = createContext(null);

/**
 * BoardContext 훅
 * BoardProvider 외부에서 호출하면 에러를 던져 잘못된 사용을 방지
 */
export const useBoardContext = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext는 BoardProvider 안에서만 사용할 수 있습니다.');
  return ctx;
};

export const BoardProvider = ({ facilityId, children }) => {

  // 원본 전체 데이터 - 마운트 시 1회 로드 후 변경 안 함
  const [allPosts, setAllPosts] = useState([]);
  
  // 드롭다운 선택 상태 (게시판 종류)
  // BOARD_OPTIONS[0] = { label: '전체 게시판', value: 'ALL' }
  const [selectedBoard, setSelectedBoard] = useState(BOARD_OPTIONS[0]);

  // 필터/검색 상태
  const [currentTab, setCurrentTab] = useState(null);   // null = 전체
  const [currentPage, setCurrentPage] = useState(0);    // 0-based
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('all');  // 'title' | 'content' | 'all'

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
      const res = await postApi.getPostList(facilityId, null, 0, 9999);

      // CHECK!!! 백엔드 응답 구조 확인 필요 - res.data가 배열인지, res.data.content인지
      setAllPosts(res.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  /**
   * 게시판(드롭다운) 변경
   * 탭/검색/페이지 모두 초기화
   */
  const changeBoard = useCallback((option) => {
    setSelectedBoard(option);
    setCurrentTab(null);
    setCurrentPage(0);
    setSearchKeyword('');
    setSearchType('all');
  }, []);

  /**
   * 탭 변경
   * 페이지를 0으로 초기화하고 검색도 초기화
   */
  const changeTab = useCallback((type) => {
    setCurrentTab(type);
    setCurrentPage(0);
    setSearchKeyword('');
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
   * 탭 + 검색 필터 적용한 게시글 목록
   * allPosts, currentTab, searchKeyword, searchType이 변경될 때만 재계산
   */
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    // 1단계: 게시판 필터 (ALL이면 전체, 아니면 해당 게시판 PostType 묶음으로 필터링)
    if (selectedBoard.value !== 'ALL') {
      const types = BOARD_TYPE_MAP[selectedBoard.value] ?? [];
      result = result.filter((post) => types.includes(post.type));
    }

    // 2단계: 탭 필터 (null이면 전체)
    if (currentTab) {
      result = result.filter((post) => post.type === currentTab);
    }

    // 3단계: 검색 필터
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((post) => {
        const inTitle = post.title?.toLowerCase().includes(keyword);
        const inContent = post.content?.toLowerCase().includes(keyword);
        if (searchType === 'title') return inTitle;
        if (searchType === 'content') return inContent;
        return inTitle || inContent; // 'all'
      });
    }

    return result;
  }, [allPosts, selectedBoard, currentTab, searchKeyword, searchType]);

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
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
