import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPortal } from 'react-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresAuth: boolean;
}

interface BottomNavigationBarProps {
  closeMenu?: () => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({ closeMenu }) => {
  console.log('🚀 BottomNavigationBar component rendering...');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  console.log('🔍 Navigation state:', { isAuthenticated, currentPath: location.pathname });
  
  // GitHubイシュー#175: Google One Tapとの重複防止のため認証画面で非表示
  const isAuthScreen = location.pathname === '/auth';
  if (isAuthScreen) {
    console.log('🚫 Auth screen detected - hiding Bottom Navigation Bar for Google One Tap');
    return null;
  }
  
  // 管理者ページ(/admin配下)ではボトムナビゲーションを非表示
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) {
    console.log('🚫 Admin page detected - hiding Bottom Navigation Bar to prevent modal overlay issues');
    return null;
  }
  
  const navigationItems: NavigationItem[] = [
    {
      id: 'mypage',
      label: 'マイページ',
      icon: '📚',
      path: '/mypage',
      requiresAuth: true
    },
    {
      id: 'read',
      label: '読む',
      icon: '📖',
      path: '/reading',
      requiresAuth: true
    },
    {
      id: 'memo',
      label: 'メモ',
      icon: '📝',
      path: '/input',
      requiresAuth: true
    },
    {
      id: 'write',
      label: '書く',
      icon: '✍️',
      path: '/draft-output',
      requiresAuth: true
    }
  ];

  const handleNavigation = (item: NavigationItem, event: React.MouseEvent) => {
    // ハンバーガーメニューが開いている場合は閉じる
    if (closeMenu) {
      closeMenu();
    }
    
    if (item.requiresAuth && !isAuthenticated) {
      event.preventDefault();
      navigate('/auth');
    }
  };

  console.log('📱 About to render navigation with', navigationItems.length, 'items');

  // Portal用の要素を作成または取得
  let portalRoot = document.getElementById('bottom-nav-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'bottom-nav-portal';
    document.body.appendChild(portalRoot);
  }

  // CSS ホバー効果用のスタイル
  const hoverStyles = `
    .bottom-nav-container {
      display: block !important;
    }
    @media (min-width: 768px) {
      .bottom-nav-container {
        display: none !important;
      }
    }
    .bottom-nav-item {
      transition: all 0.2s ease;
      background-color: transparent;
      color: rgb(75, 85, 99);
    }
    .bottom-nav-item:hover {
      background-color: rgba(251, 146, 60, 0.1) !important;
      color: rgb(234, 88, 12) !important;
      transform: scale(1.05) !important;
    }
    .bottom-nav-item.active {
      background-color: rgba(251, 146, 60, 0.1) !important;
      color: rgb(234, 88, 12) !important;
    }
  `;

  const navigationBar = (
    <div>
      {/* CSS ホバー効果用スタイル注入 */}
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />

      <nav 
        className="bottom-nav-container block md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(251, 146, 60, 0.1)',
          color: 'white',
          padding: '12px',
          zIndex: 999999,
          pointerEvents: 'auto',
          minHeight: '60px'
        }}
        role="navigation"
        aria-label="メインナビゲーション"
      >
        <div className="flex items-stretch justify-center max-w-2xl mx-auto px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(event) => handleNavigation(item, event)}
                className={`bottom-nav-item flex flex-col items-center justify-center px-2 py-2 rounded-lg min-w-0 flex-1 ${
                  isActive ? 'active' : ''
                }`}
                aria-label={`${item.label}ページに移動`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-center w-8 h-8 mb-1">
                  <span className="text-2xl leading-none" role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                </div>
                <span className="text-xs font-medium truncate text-center w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );

  // React Portalを使用してdocument.bodyに直接レンダリング
  return createPortal(navigationBar, portalRoot);
};

export default BottomNavigationBar;