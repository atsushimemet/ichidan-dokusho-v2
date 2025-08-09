import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresAuth: boolean;
}

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
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

  // 認証が必要な項目を認証状態に応じてフィルタリング
  const visibleItems = navigationItems.filter(item => 
    !item.requiresAuth || (item.requiresAuth && isAuthenticated)
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-orange-100 py-3 z-40 block md:hidden"
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <div className="flex justify-around items-center max-w-2xl mx-auto px-4">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 ${
                isActive
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              aria-label={`${item.label}ページに移動`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl mb-1" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;