import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackError, trackUserLogin } from '../utils/analytics';
import { isWebView, getWebViewInfo, showBrowserOpenPrompt, attemptBrowserRedirect } from '../utils/webview';

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // WebView検知とブラウザリダイレクト処理
  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const webViewInfo = getWebViewInfo();
    
    console.log('🔍 AuthScreen mounted');
    console.log('🔍 Google Client ID:', clientId);
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 WebView Info:', webViewInfo);
    
    // WebView環境の場合の処理
    if (webViewInfo.isWebView) {
      console.log('⚠️ WebView detected:', webViewInfo.webViewType);
      
      // 特定のWebView環境では自動リダイレクトを試行
      const aggressiveRedirectApps = ['LINE', 'Instagram', 'Facebook', 'Twitter/X', 'WeChat'];
      
      if (aggressiveRedirectApps.includes(webViewInfo.webViewType)) {
        console.log('🚀 Attempting automatic redirect for', webViewInfo.webViewType);
        
        // 1秒後に自動リダイレクトを試行
        setTimeout(() => {
          attemptBrowserRedirect(
            () => {
              // 成功時のトラッキング
              trackError('webview_auto_redirect_success', `${webViewInfo.webViewType} -> Browser`);
            },
            () => {
              // 失敗時は手動プロンプトを表示
              console.log('💬 Showing manual prompt after auto-redirect failed');
              setTimeout(() => {
                showBrowserOpenPrompt(() => {
                  trackError('webview_manual_redirect', `${webViewInfo.webViewType} -> Browser`);
                });
              }, 1000);
            }
          );
        }, 1000);
      } else {
        // その他のWebView環境では2秒後に手動プロンプトを表示
        setTimeout(() => {
          showBrowserOpenPrompt(() => {
            trackError('webview_browser_redirect', `${webViewInfo.webViewType} -> Browser`);
          });
        }, 2000);
      }
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

        {/* WebView検知時の注意メッセージ - メモに基づく改善版 */}
        {isWebView() && (
          <div 
            id="inapp-warning" 
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6"
            style={{ display: 'block' }}
          >
            <div className="flex items-start">
              <span className="text-red-600 mr-2">🚫</span>
              <div>
                <p className="text-sm text-red-800 font-medium mb-2">
                  この画面はアプリ内ブラウザではGoogleログインできません
                </p>
                <a 
                  href={window.location.href}
                  rel="noopener"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Safari/Chromeで開く
                </a>
                <p className="text-xs text-red-700 mt-2">
                  ※ 安全なログインのため、外部ブラウザでの利用を推奨します
                </p>
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
