/**
 * WebView検知とブラウザリダイレクト機能
 */

/**
 * 現在の環境がWebViewかどうかを判定
 * @returns WebViewの場合true、通常のブラウザの場合false
 */
export const isWebView = (): boolean => {
  const userAgent = navigator.userAgent;
  
  // Android WebView検知
  if (userAgent.includes('Android')) {
    // Android 5.0以上: "wv"フィールドで判定
    if (userAgent.includes('wv')) {
      return true;
    }
    
    // Android 4.4以下: "Version/"フィールドで判定
    if (userAgent.includes('Version/') && userAgent.includes('Chrome')) {
      return true;
    }
  }
  
  // iOS WebView検知
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    // Safari以外のアプリ内ブラウザ（WebView）
    if (!userAgent.includes('Safari') || userAgent.includes('WebView')) {
      return true;
    }
    
    // LINE, Twitter, Instagram等の特定アプリ検知
    if (userAgent.includes('Line/') || 
        userAgent.includes('FBAN/') || 
        userAgent.includes('FBAV/') ||
        userAgent.includes('Instagram')) {
      return true;
    }
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
    if (userAgent.includes('Line/')) {
      webViewType = 'LINE';
    } else if (userAgent.includes('FBAN/') || userAgent.includes('FBAV/')) {
      webViewType = 'Facebook';
    } else if (userAgent.includes('Instagram')) {
      webViewType = 'Instagram';
    } else if (userAgent.includes('Twitter')) {
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
 * 現在のURLをデフォルトブラウザで開く
 * WebView環境で外部ブラウザにリダイレクトするための関数
 */
export const openInBrowser = (url?: string) => {
  const targetUrl = url || window.location.href;
  
  try {
    // 新しいウィンドウで開く（多くのWebViewでブラウザにリダイレクトされる）
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    
    // フォールバック: location.hrefでの直接遷移
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
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
  
  const message = `${appName}内のブラウザでは正常にログインできない場合があります。\n\n外部ブラウザで開きますか？`;
  
  if (confirm(message)) {
    openInBrowser();
    if (onConfirm) onConfirm();
  }
};