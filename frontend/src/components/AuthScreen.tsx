import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackError, trackUserLogin } from '../utils/analytics';
import { isWebView, getWebViewInfo, showBrowserOpenPrompt } from '../utils/webview';

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // WebView検知とデバッグ用
  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const webViewInfo = getWebViewInfo();
    
    console.log('🔍 AuthScreen mounted');
    console.log('🔍 Google Client ID:', clientId);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 WebView Info:', webViewInfo);
    
    // WebView環境の場合、ブラウザで開くことを促す
    if (webViewInfo.isWebView) {
      console.log('⚠️ WebView detected:', webViewInfo.webViewType);
      // 自動的にブラウザオープンを促す（3秒後）
      setTimeout(() => {
        showBrowserOpenPrompt(() => {
          // ブラウザで開いた後のトラッキング
          trackError('webview_browser_redirect', `${webViewInfo.webViewType} -> Browser`);
        });
      }, 3000);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // 認証情報を保存
      login(data.token, data.user);
      
      // Google Analytics ログイン追跡
      trackUserLogin('google');
      
      // ホームページ（タイムライン）に遷移
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      trackError('authentication_failed', error instanceof Error ? error.message : 'Unknown error');
      alert('認証に失敗しました。もう一度お試しください。');
    }
  };

  const handleGoogleError = () => {
    console.error('🚨 Google login failed');
    console.error('🚨 User Agent:', navigator.userAgent);
    console.error('🚨 Current URL:', window.location.href);
    trackError('google_login_failed', 'Google OAuth error');
    alert('Google認証に失敗しました。もう一度お試しください。');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100 max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-orange-800 mb-6">
          🔐 ログイン
        </h1>
        
        <p className="text-center text-gray-600 mb-8 text-sm">
          読書記録を投稿するには<br />
          Googleアカウントでログインしてください
        </p>

        {/* WebView検知時の注意メッセージ */}
        {isWebView() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  アプリ内ブラウザで開いています
                </p>
                <p className="text-xs text-yellow-700">
                  ログインできない場合は、外部ブラウザで開いてください
                </p>
                <button
                  onClick={() => showBrowserOpenPrompt()}
                  className="text-xs text-yellow-800 underline hover:text-yellow-900 mt-2"
                >
                  → 外部ブラウザで開く
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
};

export default AuthScreen; 
