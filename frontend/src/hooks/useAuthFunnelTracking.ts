import { useEffect, useState } from 'react';
import { isWebView, getWebViewInfo } from '../utils/webview';

interface AuthFunnelData {
  step: string;
  timestamp: number;
  userAgent: string;
  webViewDetected: boolean;
  webViewType?: string;
}

export const useAuthFunnelTracking = () => {
  const [funnelData, setFunnelData] = useState<AuthFunnelData>({
    step: '',
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    webViewDetected: isWebView(),
    webViewType: isWebView() ? getWebViewInfo().webViewType : undefined
  });

  const updateFunnelStep = (step: string) => {
    setFunnelData(prev => ({
      ...prev,
      step,
      timestamp: Date.now()
    }));
  };

  const getFunnelDuration = () => {
    return Date.now() - funnelData.timestamp;
  };

  const getFunnelContext = () => {
    return {
      ...funnelData,
      duration: getFunnelDuration(),
      url: window.location.href,
      referrer: document.referrer
    };
  };

  // コンポーネントのアンマウント時にファネル離脱を記録
  useEffect(() => {
    return () => {
      if (funnelData.step && !funnelData.step.includes('success')) {
        console.log('Auth funnel exit:', getFunnelContext());
      }
    };
  }, [funnelData]);

  return {
    funnelData,
    updateFunnelStep,
    getFunnelDuration,
    getFunnelContext
  };
};