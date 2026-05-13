import React from 'react';

// 오른쪽 아래 추가 버튼 하나
const FloatingAddButton = ({ onClick, label = '추가', disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-full shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </button>
  );
};

export default FloatingAddButton;