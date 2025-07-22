// Google Analytics カスタムイベント追跡ユーティリティ

// ページビュー追跡
export const trackPageView = (pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-NEMWYXHV2P', {
      page_path: pagePath,
    });
  }
};

// カスタムイベント追跡
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// ユーザー登録追跡
export const trackUserRegistration = (method: string) => {
  trackEvent('sign_up', 'engagement', method);
};

// ログイン追跡
export const trackUserLogin = (method: string) => {
  trackEvent('login', 'engagement', method);
};

// 投稿作成追跡
export const trackPostCreation = (readingAmount: string) => {
  trackEvent('post_creation', 'engagement', readingAmount);
};

// シェア追跡
export const trackShare = (platform: string, charCount: number) => {
  trackEvent('share', 'engagement', platform, charCount);
};

// いいね追跡
export const trackLike = (action: 'like' | 'unlike') => {
  trackEvent(action, 'engagement');
};

// エラー追跡
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('error', 'error', errorType);
  console.error(`Analytics Error: ${errorType} - ${errorMessage}`);
}; 
