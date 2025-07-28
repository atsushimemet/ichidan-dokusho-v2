import { useState } from 'react';

export interface ExpandableTextState {
  [recordId: number]: {
    learning: boolean;
    action: boolean;
    notes: boolean;
  }
}

export const useExpandableText = () => {
  // 表示モードでのテキスト展開状態管理（レコードID別）
  const [expandedTexts, setExpandedTexts] = useState<ExpandableTextState>({});

  // 表示モードでのテキスト展開/折りたたみを切り替える関数
  const toggleTextExpansion = (recordId: number, field: 'learning' | 'action' | 'notes') => {
    setExpandedTexts(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: !prev[recordId]?.[field]
      }
    }));
  };

  // テキストが長いかどうかを判定する関数
  const isTextLong = (text: string) => {
    return text.length > 100; // 100文字以上で「さらに表示」を表示
  };

  // 表示用テキストを取得する関数（展開状態に応じて）
  const getDisplayText = (recordId: number, field: 'learning' | 'action' | 'notes', text: string) => {
    const isExpanded = expandedTexts[recordId]?.[field];
    if (!isTextLong(text) || isExpanded) {
      return text;
    }
    return text.substring(0, 100) + '...';
  };

  return {
    expandedTexts,
    toggleTextExpansion,
    isTextLong,
    getDisplayText
  };
};