import React from 'react';

interface ExpandableTextDisplayProps {
  recordId: number;
  field: 'learning' | 'action' | 'notes';
  text: string;
  displayText: string;
  isTextLong: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  bgColor: string;
  borderColor: string;
  icon: string;
  title: string;
}

const ExpandableTextDisplay: React.FC<ExpandableTextDisplayProps> = ({
  displayText,
  isTextLong,
  isExpanded,
  onToggle,
  bgColor,
  borderColor,
  icon,
  title
}) => {
  return (
    <div className="mb-2 sm:mb-4">
      <h4 className="font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">{icon} {title}</h4>
      <div className={`min-h-[60px] sm:min-h-[80px] ${bgColor} p-2 sm:p-3 rounded-lg border-l-4 ${borderColor}`}>
        <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
          {displayText}
        </p>
        {isTextLong && (
          <div className="mt-1 sm:mt-2 text-right">
            <button
              type="button"
              onClick={onToggle}
              className="text-xs text-blue-600 hover:text-blue-800 bg-white/80 px-2 py-1 rounded shadow-sm"
            >
              {isExpanded ? '折りたたむ' : 'さらに表示'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableTextDisplay;