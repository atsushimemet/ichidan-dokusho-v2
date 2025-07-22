import React from 'react';

interface BookIconProps {
  className?: string;
  size?: number;
}

const BookIcon: React.FC<BookIconProps> = ({ className = '', size = 24 }) => {
  return (
    <img 
      src="/favicon.jpg" 
      alt="一段読書アイコン"
      width={size} 
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default BookIcon; 
