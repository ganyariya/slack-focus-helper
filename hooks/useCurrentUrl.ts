import { useState, useEffect } from 'react';
import { GetCurrentUrlResponse } from '../types';

export function useCurrentUrl() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUrl = async () => {
    try {
      setError(null);
      
      const response = await browser.runtime.sendMessage({ 
        type: 'GET_CURRENT_URL' 
      }) as GetCurrentUrlResponse;
      
      if (response?.url) {
        setCurrentUrl(response.url);
        return;
      }
      
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url);
      } else {
        setError('現在のURLを取得できませんでした');
      }
    } catch (err) {
      setError('URLの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUrl();
  }, []);

  return {
    currentUrl,
    loading,
    error,
    refetch: fetchCurrentUrl
  };
}