import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AutoContext.jsx';
import { resolveStaffFacilityId } from '../../utils/jwtUtils';
import { BoardProvider, useBoardContext } from '../../contexts/BoardContext';
import { BOARD_OPTIONS, BOARD_TABS_MAP, FILTER_OPTIONS, SORT_OPTIONS } from '../../utils/boardUtils';
import FilterTab from '../../components/common/FilterTab';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import PostList from '../../components/board/PostList';
import Button from '../../components/Button';
import Header from '../../components/common/Header';
import { useI18n } from '../../hooks/useI18n.jsx';
import filterIcon from '../../assets/filter.svg';

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
    filterType,
    sortOrder,
    isLoading,
    error,
    totalPages,
    filteredPosts,
    paginatedPosts,
    fetchAllPosts,
    changeBoard,
    changeTab,
    changePage,
    search,
    resetSearch,
    changeFilter,
    changeSort,
  } = useBoardContext();
  const { t } = useI18n();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // 마운트 시 전체 데이터 1회 로드
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  // 드롭다운/필터/정렬 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSortLabel = t(
    SORT_OPTIONS.find((s) => s.value === sortOrder)?.labelKey ?? '',
    SORT_OPTIONS.find((s) => s.value === sortOrder)?.label ?? '최신순'
  );

  // 현재 선택된 게시판의 탭 목록
  // null이면 탭 없음 (전체 게시판, 자유 게시판)
  const currentTabs = BOARD_TABS_MAP[selectedBoard.value] ?? null;

  // 게시판 변경 시 탭 및 검색 초기화 + URL 동기화 (뒤로가기 복원을 위해)
  const handleBoardSelect = (option) => {
    changeBoard(option);
    const query = option.value !== 'ALL' ? `?board=${option.value}` : '';
    navigate(`/facilities/${facilityId}/board${query}`, { replace: true });
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
            className="flex items-center gap-2 text-xl font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            {t(selectedBoard.labelKey ?? selectedBoard.label, selectedBoard.label)}
            <span className="text-sm text-slate-400">{isDropdownOpen ? '▲' : '▽'}</span>
          </button>

          {isDropdownOpen && (
            <ul className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
              {BOARD_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => handleBoardSelect(option)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${selectedBoard.value === option.value
                        ? 'text-blue-700 font-semibold bg-blue-50'
                        : 'text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    {t(option.labelKey ?? option.label, option.label)}
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
          onClick={() => navigate(`/facilities/${facilityId}/board/create${selectedBoard.value !== 'ALL' ? `?type=${selectedBoard.value}` : ''}`)}
        >
          + {t('board.list.createPost', '새 게시물 작성')}
        </Button>
      </div>

      {/* 검색바 */}
      <SearchBar
        searchType={searchType}
        searchKeyword={searchKeyword}
        onSearch={search}
        onReset={resetSearch}
      />

      {/* 탭: 전체 게시판(ALL)과 자유 게시판(GENERAL)은 탭 없음 */}
      {currentTabs && (
        <FilterTab
          tabs={currentTabs}
          currentTab={currentTab}
          onChange={changeTab}
        />
      )}

      {/* 게시글 목록 카드 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mt-4">

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          {/* 좌측: 제목 + 건수 */}
          <span className="text-sm font-semibold text-slate-900">
            {t('board.list.recentPosts', '최근 게시물')}
            <span className="ml-2 text-xs font-normal text-slate-400">
              {filteredPosts.length}{t('board.list.count', '개')}
            </span>
          </span>

          {/* 우측: 필터 + 정렬 */}
          <div className="flex items-center gap-2">

            {/* 필터 드롭다운 */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => { setIsFilterOpen((p) => !p); setIsSortOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                  ${filterType
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                <img
                  src={filterIcon}
                  alt=""
                  className={`w-3.5 h-3.5 ${filterType ? 'opacity-100' : 'opacity-60'}`}
                  style={{
                    filter: filterType
                      ? 'invert(38%) sepia(94%) saturate(1352%) hue-rotate(203deg) brightness(97%) contrast(95%)'
                      : undefined
                  }}
                />

                {t('board.list.filter', '필터')}

                {filterType && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}

                <span className="text-slate-400">{isFilterOpen ? '▲' : '▾'}</span>
              </button>

              {isFilterOpen && (
                <ul className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <li key={opt.value ?? 'all'}>
                      <button
                        onClick={() => { changeFilter(opt.value); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors
                          ${filterType === opt.value
                            ? 'text-blue-700 font-semibold bg-blue-50'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        {t(opt.labelKey, opt.label)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 정렬 드롭다운 */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => { setIsSortOpen((p) => !p); setIsFilterOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                  ${sortOrder !== 'newest'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                {activeSortLabel}
                <span className="text-slate-400">{isSortOpen ? '▲' : '▾'}</span>
              </button>

              {isSortOpen && (
                <ul className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        onClick={() => { changeSort(opt.value); setIsSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors
                          ${sortOrder === opt.value
                            ? 'text-blue-700 font-semibold bg-blue-50'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        {t(opt.labelKey, opt.label)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>

        <div className="px-5 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              {t('board.loading', '불러오는 중...')}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-400">
              {t('board.error.loadFailed', '데이터를 불러오지 못했습니다.')}
            </div>
          ) : (
            <PostList
              posts={paginatedPosts}
              mode="table"
              facilityId={facilityId}
              boardType={selectedBoard.value}
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

    </div>
  );
};

/**
 * 게시판 목록 페이지
 * BoardProvider로 감싸서 Context 제공
 */
const BoardListPage = () => {
  const navigate = useNavigate();
  const { facilityId: facilityIdParam } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const board = searchParams.get('board');
  const initialBoardValue = BOARD_OPTIONS.some((option) => option.value === board)
    ? board
    : 'ALL';

  const paramId = Number(facilityIdParam);
  const facilityId =
    Number.isFinite(paramId) && paramId > 0
      ? paramId
      : resolveStaffFacilityId(user);

  useEffect(() => {
    if (!facilityId) return;
    const paramNum = Number(facilityIdParam);
    if (!Number.isFinite(paramNum) || paramNum <= 0 || paramNum !== facilityId) {
      const q = board ? `?board=${board}` : '';
      navigate(`/facilities/${facilityId}/board${q}`, { replace: true });
    }
  }, [facilityId, facilityIdParam, board, navigate]);

  if (!facilityId) {
    return (
      <>
        <Header activeNav="notice" />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
          {t('board.list.noFacility', '시설 정보를 확인할 수 없습니다. 다시 로그인해 주세요.')}
        </div>
      </>
    );
  }

  return (
    <>
      <Header activeNav="notice" />
      <div className="min-h-screen bg-slate-50">
        <BoardProvider
          key={facilityId}
          facilityId={facilityId}
          initialBoardValue={initialBoardValue}
        >
          <BoardListContent />
        </BoardProvider>
      </div>
    </>
  );
};

export default BoardListPage;