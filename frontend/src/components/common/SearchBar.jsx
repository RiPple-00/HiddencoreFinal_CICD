import { useState } from 'react';
import { SEARCH_TYPES } from '../../utils/boardUtils';
import Input from '../Input';
import Button from '../Button';

/**
 * 공통 검색바 컴포넌트
 * @param {string} searchType - 현재 검색 타입 ('all' | 'title' | 'content')
 * @param {string} searchKeyword - 현재 검색 키워드
 * @param {function} onSearch - 검색 실행 콜백 (searchType, keyword 전달)
 * @param {function} onReset - 검색 초기화 콜백
 */
const SearchBar = ({ searchType, searchKeyword, onSearch, onReset }) => {
  // 실제 제출 전까지 로컬에서 관리
  const [localType, setLocalType] = useState(searchType ?? 'all');
  const [localKeyword, setLocalKeyword] = useState(searchKeyword ?? '');

  const handleSearch = () => {
    if (!localKeyword.trim()) {
      onReset();
      return;
    }
    onSearch(localType, localKeyword.trim());
  };

  // 엔터키 검색 지원
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
   <div className="flex items-center gap-2 mt-4">

      {/* 검색 타입 셀렉트 - Input 미지원으로 직접 사용 */}
      <select
        value={localType}
        onChange={(e) => setLocalType(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {SEARCH_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {/* 키워드 입력 - Input 컴포넌트 사용 */}
      <div className="flex-1">
        <Input
          type="text"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어를 입력하세요"
        />
      </div>

      {/* 검색 버튼 - Button 컴포넌트 사용 */}
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={handleSearch}
      >
        검색
      </Button>

    </div>  );
};

export default SearchBar;
