import { GoogleLogin } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackError, trackUserLogin, trackAuthFunnelStep, trackAuthFunnelComplete, trackAuthError, trackPageExit, trackExternalBrowserClick } from '../utils/analytics';
import { isWebView, getWebViewInfo, handleExternalBrowserOpen } from '../utils/webview';

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pageStartTime] = useState(Date.now());
  
  // コンポーネントマウント時の追跡とページ離脱追跡
  useEffect(() => {
    // 認証画面表示を追跡
    trackAuthFunnelStep('3_auth_screen_view');
    
    // ページ離脱時の処理
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime;
      trackPageExit('/auth', timeOnPage);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageStartTime]);
  
  // WebView検知ログ出力のみ
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const webViewInfo = getWebViewInfo();
    
    console.log('🔍 AuthScreen mounted');
    console.log('🔍 Google Client ID:', clientId);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 WebView Info:', webViewInfo);
    
    if (webViewInfo.isWebView) {
      console.log('⚠️ WebView detected:', webViewInfo.webViewType);
      console.log('💬 User should use the external browser button to login');
    }
  }, []);

  const handleGoogleLoginClick = () => {
    trackAuthFunnelStep('4_google_login_click');
  };

  const handleGoogleSuccess = async (credentialResponse: { credential: string }) => {
    try {
      trackAuthFunnelStep('5_auth_api_start');
      
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
      
      // 認証完了追跡
      trackAuthFunnelComplete();
      trackUserLogin('google');
      
      // ホームページ（タイムライン）に遷移
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackAuthError('api_error', errorMessage);
      trackError('authentication_failed', errorMessage);
      alert('認証に失敗しました。もう一度お試しください。');
    }
  };

  const handleGoogleError = () => {
    console.error('🚨 Google login failed');
    console.error('🚨 User Agent:', navigator.userAgent);
    console.error('🚨 Current URL:', window.location.href);
    trackAuthError('google_auth_failed', 'Google login popup failed');
    trackError('google_login_failed', 'Google OAuth error');
    alert('Google認証に失敗しました。もう一度お試しください。');
  };

  const handleExternalBrowserClickWithTracking = (event: React.MouseEvent) => {
    trackExternalBrowserClick();
    handleExternalBrowserOpen(event);
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

        {/* WebView検知時の注意メッセージ - トップ画面と同種のコンポーネント */}
        {isWebView() ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  アプリ内ブラウザで開いています
                </p>
                <p className="text-xs text-yellow-700">
                  ログイン機能を正常に利用するには外部ブラウザをご利用ください
                </p>
                <button
                  onClick={handleExternalBrowserClickWithTracking}
                  className="text-xs text-yellow-800 underline hover:text-yellow-900 mt-2"
                >
                  → 外部ブラウザで開く
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div onClick={handleGoogleLoginClick}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
          </div>
        )}

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
