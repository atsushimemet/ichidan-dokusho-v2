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
  const userAgent = navigator.userAgent.toLowerCase();
  
  console.log('🚀 Opening URL in external browser from WebView:', targetUrl);
  console.log('🔍 User Agent:', userAgent);
  
  // WebView環境別の最適化されたアプローチ
  const webViewInfo = getWebViewInfo();
  console.log('🔍 WebView Info:', webViewInfo);
  
  try {
    let success = false;
    
    // 1. iOS ブラウザ対応（Safari + Chrome）
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      console.log('📱 Trying iOS browser approaches');
      
      // 1a. iOS Safari専用スキーム
      const safariUrl = `x-safari-https://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`;
      console.log('🔗 Trying Safari scheme:', safariUrl);
      
      try {
        window.location.href = safariUrl;
        success = true;
        console.log('✅ iOS Safari scheme redirect attempted');
        
        // Safariで開けなかった場合のフォールバック（短時間待機後にChrome試行）
        setTimeout(() => {
          if (!success) {
            console.log('🔄 Safari failed, trying Chrome fallback');
            
            // 1b. iOS Chrome専用スキーム
            const chromeUrl = targetUrl.startsWith('https://') 
              ? `googlechromes://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`
              : `googlechrome://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`;
            console.log('🔗 Trying Chrome scheme:', chromeUrl);
            
            try {
              window.location.href = chromeUrl;
              console.log('✅ iOS Chrome scheme redirect attempted');
            } catch (chromeError) {
              console.log('❌ iOS Chrome scheme failed:', chromeError);
              success = false;
            }
          }
        }, 500);
        
      } catch (e) {
        console.log('❌ iOS Safari scheme failed, trying Chrome immediately:', e);
        
        // Safari失敗時は即座にChrome試行
        const chromeUrl = targetUrl.startsWith('https://') 
          ? `googlechromes://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`
          : `googlechrome://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}`;
        console.log('🔗 Trying Chrome scheme:', chromeUrl);
        
        try {
          window.location.href = chromeUrl;
          success = true;
          console.log('✅ iOS Chrome scheme redirect attempted');
        } catch (chromeError) {
          console.log('❌ iOS Chrome scheme also failed:', chromeError);
          success = false;
        }
      }
    }
    
    // 2. Android Chrome Intent アプローチ
    if (!success && userAgent.includes('android')) {
      console.log('🤖 Trying Android Chrome intent approach');
      
      const intentUrl = `intent://${new URL(targetUrl).host}${new URL(targetUrl).pathname}${new URL(targetUrl).search}#Intent;scheme=https;package=com.android.chrome;end`;
      console.log('🔗 Trying Chrome intent:', intentUrl);
      
      try {
        window.location.href = intentUrl;
        success = true;
        console.log('✅ Android Chrome intent redirect attempted');
      } catch (e) {
        console.log('❌ Android Chrome intent failed:', e);
      }
    }
    
    // 3. 汎用的なwindow.open試行（ポップアップブロッカー回避）
    if (!success) {
      console.log('🌐 Trying enhanced window.open approach');
      
      // より強力なwindow.openパラメータ
      const windowFeatures = 'noopener,noreferrer,popup=no,toolbar=yes,location=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes';
      const newWindow = window.open(targetUrl, '_blank', windowFeatures);
      
      // window.openの成功判定を遅延実行
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          console.log('⚠️ Enhanced window.open failed after timeout check');
          // フォールバック: location.href
          console.log('🔄 Falling back to location.href');
          window.location.href = targetUrl;
        } else {
          console.log('✅ Enhanced window.open succeeded');
          success = true;
        }
      }, 100);
    }
    
    // 4. 最終手段: 直接遷移（_top ターゲット指定）
    if (!success) {
      console.log('🎯 Final fallback: direct navigation with _top target');
      
      // iframe内でも確実に親ウィンドウで開く
      if (window.top && window.top !== window.self) {
        console.log('🪟 Opening in parent window (iframe detected)');
        window.top.location.href = targetUrl;
      } else {
        console.log('🪟 Opening in current window');
        window.location.href = targetUrl;
      }
      
      success = true;
    }
    
    console.log(success ? '✅ Browser redirect initiated successfully' : '❌ All redirect methods failed');
    
  } catch (error) {
    console.error('💥 Critical error in openInBrowser:', error);
    console.error('📋 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // 緊急フォールバック
    console.log('🚨 Emergency fallback: simple location.href');
    try {
      window.location.href = targetUrl;
    } catch (finalError) {
      console.error('💀 Even emergency fallback failed:', finalError);
      // ユーザーに手動での操作を促す
      alert(`外部ブラウザでの開放に失敗しました。\n\n以下のURLを手動でコピーして外部ブラウザで開いてください:\n\n${targetUrl}`);
    }
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