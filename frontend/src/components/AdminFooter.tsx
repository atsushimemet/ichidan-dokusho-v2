import React from 'react';

interface AdminFooterProps {
  onMobileConsoleToggle: () => void;
  isMobileConsoleVisible: boolean;
}

const AdminFooter: React.FC<AdminFooterProps> = ({ 
  onMobileConsoleToggle, 
  isMobileConsoleVisible 
}) => {
  return (
    <footer className={`fixed left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-orange-100 transition-all duration-200 ${
      isMobileConsoleVisible ? 'bottom-96 z-30' : 'bottom-0 z-40'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <button
            onClick={onMobileConsoleToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isMobileConsoleVisible 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
            title={isMobileConsoleVisible ? 'モバイルコンソールを閉じる' : 'モバイルコンソールを開く'}
            aria-label={isMobileConsoleVisible ? 'モバイルコンソールを閉じる' : 'モバイルコンソールを開く'}
          >
            <span className="text-lg">📱</span>
            <span className="text-sm font-medium">
              {isMobileConsoleVisible ? 'コンソール非表示' : 'モバイルコンソール'}
            </span>
            {isMobileConsoleVisible && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                ON
              </span>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;