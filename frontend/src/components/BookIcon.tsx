import React, { useState } from 'react';

interface BookIconProps {
  className?: string;
  size?: number;
}

const BookIcon: React.FC<BookIconProps> = ({ className = '', size = 24 }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // フォールバック: シンプルなSVGアイコン
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        width={size} 
        height={size}
        className={className}
      >
        <defs>
          <style>
            {`.book-icon { fill: #f97316; }`}
          </style>
        </defs>
        
        {/* Book base */}
        <path className="book-icon" d="M6 8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8z"/>
        
        {/* Book pages */}
        <path className="book-icon" d="M8 6h16v20H8z" opacity="0.8"/>
        
        {/* Book spine */}
        <path className="book-icon" d="M14 6c0-1.1.9-2 2-2s2 .9 2 2v20c0 1.1-.9 2-2 2s-2-.9-2-2V6z" opacity="0.6"/>
        
        {/* Light rays emanating from center */}
        <g className="book-icon">
          {/* Center ray */}
          <line x1="16" y1="12" x2="16" y2="6" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Left rays */}
          <line x1="16" y1="12" x2="13" y2="8" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="12" x2="12" y2="6" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Right rays */}
          <line x1="16" y1="12" x2="19" y2="8" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="12" x2="20" y2="6" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Outer rays */}
          <line x1="16" y1="12" x2="11" y2="4" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="12" x2="21" y2="4" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </svg>
    );
  }

  return (
    <img 
      src="/favicon.jpg" 
      alt="一段読書アイコン"
      width={size} 
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      onError={() => setImageError(true)}
    />
  );
};

export default BookIcon; 
