/**
 * WebView検知とブラウザリダイレクト機能
 */

/**
 * 現在の環境がWebViewかどうかを判定
 * メモに基づいたシンプルな検知ロジック
 * @returns WebViewの場合true、通常のブラウザの場合false
 */
export const isWebView = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  
  // メモに基づく簡素化されたアプリ内ブラウザ検知
  const isInApp = /line|twitter|fbav|instagram|x\.com|micromessenger|whatsapp/.test(ua);
  
  if (isInApp) {
    return true;
  }
  
  // Android WebView検知（従来のロジックを維持）
  if (ua.includes('android')) {
    if (ua.includes('wv') || 
        (ua.includes('version/') && ua.includes('chrome')) ||
        (!ua.includes('chrome') && ua.includes('mobile'))) {
      return true;
    }
  }
  
  // iOS WebView検知（従来のロジックを維持）
  if (ua.includes('iphone') || ua.includes('ipad')) {
    if (!ua.includes('safari') || ua.includes('webview') || ua.includes('crios/')) {
      return true;
    }
  }
  
  // Desktop環境でのWebView検知（Electron等）
  if (ua.includes('electron/')) {
    return true;
  }
  
  return false;
};

/**
 * WebView検知時の詳細情報を取得
 * @returns WebViewの種類とユーザーエージェント情報
 */
export const getWebViewInfo = () => {
  const userAgent = navigator.userAgent;
  const isWebViewEnv = isWebView();
  
  let webViewType = 'unknown';
  
  if (isWebViewEnv) {
    if (userAgent.includes('Line/') || userAgent.includes('LINE/')) {
      webViewType = 'LINE';
    } else if (userAgent.includes('FBAN/') || userAgent.includes('FBAV/')) {
      webViewType = 'Facebook';
    } else if (userAgent.includes('Instagram')) {
      webViewType = 'Instagram';
    } else if (userAgent.includes('Twitter') || userAgent.includes('X.com')) {
      webViewType = 'Twitter/X';
    } else if (userAgent.includes('Android')) {
      webViewType = 'Android WebView';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      webViewType = 'iOS WebView';
    }
  }
  
  return {
    isWebView: isWebViewEnv,
    webViewType,
    userAgent,
    isMobile: /Mobi|Android/i.test(userAgent)
  };
};

/**
 * プラットフォーム別に最適化されたブラウザオープン機能
 */
export const openInBrowser = (url?: string) => {
  const targetUrl = url || window.location.href;
  const userAgent = navigator.userAgent;
  
  console.log('🚀 Attempting to open URL in browser:', targetUrl);
  
  // iOS環境の場合
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    try {
      // iOS: カスタムスキームを使用してSafariで開く
      const safariUrl = `x-web-search://?${encodeURIComponent(targetUrl)}`;
      window.location.href = safariUrl;
      
      // フォールバック1: 通常のwindow.open
      setTimeout(() => {
        const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // フォールバック2: 直接遷移
          window.location.href = targetUrl;
        }
      }, 500);
      
      return;
    } catch (error) {
      console.error('iOS browser open failed:', error);
    }
  }
  
  // Android環境の場合
  if (userAgent.includes('Android')) {
    try {
      // Android: intent:スキームを使用
      const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      window.location.href = intentUrl;
      
      // フォールバック: 通常のwindow.open
      setTimeout(() => {
        const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          window.location.href = targetUrl;
        }
      }, 500);
      
      return;
    } catch (error) {
      console.error('Android browser open failed:', error);
    }
  }
  
  // デスクトップ・その他の環境
  try {
    // 通常のwindow.openを試行
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    
    // ポップアップブロック等でwindow.openが失敗した場合
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('⚠️ window.open blocked, using fallback');
      // 即座にフォールバック実行
      window.location.href = targetUrl;
    }
  } catch (error) {
    console.error('Failed to open in browser:', error);
    // 最終手段: 直接遷移
    window.location.href = targetUrl;
  }
};

/**
 * WebView環境でのブラウザオープンを促すメッセージを表示
 */
export const showBrowserOpenPrompt = (onConfirm?: () => void) => {
  const webViewInfo = getWebViewInfo();
  const appName = webViewInfo.webViewType !== 'unknown' ? webViewInfo.webViewType : 'アプリ';
  
  const message = `${appName}内のブラウザではGoogleログインが制限される場合があります。\n\n外部ブラウザ（Safari/Chrome）で開いてログインしますか？\n\n※より安全で確実にログインできます`;
  
  if (confirm(message)) {
    console.log('✅ User confirmed browser redirect');
    openInBrowser();
    if (onConfirm) onConfirm();
  } else {
    console.log('❌ User cancelled browser redirect');
  }
};

/**
 * WebView環境で自動的にブラウザリダイレクトを試行
 */
export const attemptBrowserRedirect = (onSuccess?: () => void, onFailure?: () => void) => {
  const webViewInfo = getWebViewInfo();
  
  if (!webViewInfo.isWebView) {
    console.log('ℹ️ Not in WebView environment, skipping redirect');
    return false;
  }
  
  console.log('🔄 Attempting automatic browser redirect from WebView');
  
  try {
    openInBrowser();
    if (onSuccess) onSuccess();
    return true;
  } catch (error) {
    console.error('❌ Automatic browser redirect failed:', error);
    if (onFailure) onFailure();
    return false;
  }
};