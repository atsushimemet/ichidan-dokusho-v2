import React, { useState, useEffect, useRef } from 'react';

interface ConsoleMessage {
  id: string;
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
}

interface MobileConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const MobileConsole: React.FC<MobileConsoleProps> = ({ isVisible, onToggle }) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // コンソールメッセージを追加する関数
  const addMessage = (level: ConsoleMessage['level'], message: string, stack?: string) => {
    const newMessage: ConsoleMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('ja-JP'),
      level,
      message,
      stack
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // 元のコンソールメソッドをオーバーライド
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // console.logをオーバーライド
    console.log = (...args: any[]) => {
      originalConsole.log(...args);
      addMessage('log', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // console.errorをオーバーライド
    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // エラーオブジェクトの場合はスタックトレースも取得
      const stack = args.find(arg => arg instanceof Error)?.stack;
      addMessage('error', message, stack);
    };

    // console.warnをオーバーライド
    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      addMessage('warn', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // console.infoをオーバーライド
    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      addMessage('info', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // windowのエラーイベントをリスン
    const handleWindowError = (event: ErrorEvent) => {
      addMessage('error', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, event.error?.stack);
    };

    // unhandled promise rejectionをリスン
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addMessage('error', `Unhandled Promise Rejection: ${event.reason}`, event.reason?.stack);
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 初期メッセージ
    addMessage('info', 'モバイルコンソールが開始されました');

    // クリーンアップ
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 自動スクロール
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // ログレベルに応じたスタイル
  const getMessageStyle = (level: ConsoleMessage['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-l-4 border-red-500';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50 border-l-4 border-yellow-500';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'text-gray-600 bg-gray-50 border-l-4 border-gray-300';
    }
  };

  // ログレベルアイコン
  const getMessageIcon = (level: ConsoleMessage['level']) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const clearMessages = () => {
    setMessages([]);
    addMessage('info', 'コンソールがクリアされました');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50 max-h-96 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold">📱 モバイルコンソール</span>
          <span className="text-xs bg-gray-600 px-2 py-1 rounded">
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearMessages}
            className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded transition-colors"
            title="クリア"
          >
            🗑️
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              autoScroll ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title="自動スクロール切り替え"
          >
            {autoScroll ? '🔄' : '⏸️'}
          </button>
          <button
            onClick={onToggle}
            className="text-white hover:text-gray-300 transition-colors"
            title="閉じる"
          >
            ❌
          </button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div 
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0"
        style={{ maxHeight: '300px' }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            コンソールメッセージはここに表示されます
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded text-xs font-mono ${getMessageStyle(message.level)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0">{getMessageIcon(message.level)}</span>
                <span className="text-xs text-gray-500 flex-shrink-0 min-w-16">
                  {message.timestamp}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="break-words">{message.message}</div>
                  {message.stack && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs underline">Stack Trace</summary>
                      <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                        {message.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MobileConsole;