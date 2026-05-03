import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardProvider, useBoardContext } from '../../contexts/BoardContext';
import { BOARD_OPTIONS, BOARD_TABS_MAP } from '../../utils/boardUtils';
import FilterTab from '../../components/common/FilterTab';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import PostList from '../../components/board/PostList';
import Button from '../../components/Button';
import TopNavBar from '../../components/bedroom/TopNavBar';

/**
 * 게시판 내부 콘텐츠
 * BoardProvider 안에서만 동작하므로 BoardListPage와 분리
 */
const BoardListContent = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();

  const {
    selectedBoard,
    currentTab,
    currentPage,
    searchKeyword,
    searchType,
    isLoading,
    error,
    totalPages,
    paginatedPosts,
    fetchAllPosts,
    changeBoard,
    changeTab,
    changePage,
    search,
    resetSearch,
  } = useBoardContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 마운트 시 전체 데이터 1회 로드
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 현재 선택된 게시판의 탭 목록
  // null이면 탭 없음 (전체 게시판, 자유 게시판)
  const currentTabs = BOARD_TABS_MAP[selectedBoard.value] ?? null;

  // 게시판 변경 시 탭 및 검색 초기화
  const handleBoardSelect = (option) => {
    changeBoard(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* 페이지 헤더: 게시판 드롭다운 + 새 게시물 작성 버튼 */}
      <div className="flex items-center justify-between mb-4">

        {/* 게시판 선택 드롭다운 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
          >
            {selectedBoard.label}
            <span className="text-sm text-gray-400">{isDropdownOpen ? '▲' : '▽'}</span>
          </button>

          {isDropdownOpen && (
            <ul className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {BOARD_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => handleBoardSelect(option)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${selectedBoard.value === option.value
                        ? 'text-teal-600 font-medium bg-teal-50'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CHECK!!! 작성 권한 조건 확인 필요 - 역할별 제한 추가 예정 */}
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate(`/facilities/${facilityId}/board/create`)}
        >
          + 새 게시물 작성
        </Button>
      </div>

      {/* 탭: 전체 게시판(ALL)과 자유 게시판(GENERAL)은 탭 없음 */}
      {currentTabs && (
        <FilterTab
          tabs={currentTabs}
          currentTab={currentTab}
          onChange={changeTab}
        />
      )}

      {/* 게시글 목록 카드 */}
      <div className="bg-white border border-gray-200 rounded-lg mt-4">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">최근 게시물</span>
          <div className="flex items-center gap-2 text-gray-400">
            {/* CHECK!!! 필터 기능 추후 추가 시 onClick 연결 */}
            <button className="hover:text-gray-600 transition-colors" title="필터">
              <img src="/icons/filter.svg" alt="필터" className="w-4 h-4" />
            </button>
            {/* CHECK!!! 검색 아이콘 클릭 시 하단 SearchBar 포커스 연결 필요 */}
            <button className="hover:text-gray-600 transition-colors" title="검색">
              <img src="/icons/search.svg" alt="검색" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              불러오는 중...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-400">
              데이터를 불러오지 못했습니다.
            </div>
          ) : (
            <PostList
              posts={paginatedPosts}
              mode="table"
              facilityId={facilityId}
            />
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={changePage}
      />

      {/* 검색바 */}
      <SearchBar
        searchType={searchType}
        searchKeyword={searchKeyword}
        onSearch={search}
        onReset={resetSearch}
      />

    </div>
  );
};

/**
 * 게시판 목록 페이지
 * BoardProvider로 감싸서 Context 제공
 */
const BoardListPage = () => {
  const { facilityId } = useParams();

  return (
    <>
      <TopNavBar activeNav="notice" />
      <BoardProvider facilityId={Number(facilityId)}>
        <BoardListContent />
      </BoardProvider>
    </>
  );
};

export default BoardListPage;
