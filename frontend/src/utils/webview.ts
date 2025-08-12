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
 * WebView環境でのみ使用する外部ブラウザオープン機能
 * 通常のWebアプリでは使用されない
 */
export const openInBrowser = (url?: string) => {
  const targetUrl = url || window.location.href;
  const userAgent = navigator.userAgent;
  
  console.log('🚀 Opening URL in external browser from WebView:', targetUrl);
  
  try {
    // WebView環境での確実な外部ブラウザオープン
    // 最もシンプルで確実な方法: window.open
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    
    // window.openが失敗した場合のフォールバック
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('⚠️ window.open failed, trying direct navigation');
      // 直接遷移（多くのWebViewで外部ブラウザに転送される）
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
 * UIコンポーネント内で手動で呼び出される
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
 * 自動リダイレクトは削除し、手動のみとする
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

/**
 * 外部ブラウザオープン用のイベントハンドラ
 * WebView環境でのボタンクリック時に使用
 */
export const handleExternalBrowserOpen = (event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('🔗 External browser button clicked');
  openInBrowser();
};