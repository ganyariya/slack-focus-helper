import { CheckBlockResponse } from '../types';
import { BLOCKED_URL_PREFIXES, URL_MONITORING } from '../utils/constants';

function shouldSkipUrl(url: string): boolean {
  return !url || BLOCKED_URL_PREFIXES.some(prefix => url.startsWith(prefix));
}

function buildBlockPageUrl(response: CheckBlockResponse): string {
  const baseUrl = `${browser.runtime.getURL('')}block.html`;
  const params = new URLSearchParams({
    group: response.groupName || '',
    time: response.currentTime || '',
    url: response.matchedUrl || ''
  });
  return `${baseUrl}?${params.toString()}`;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {

    let currentUrl = location.href;
    let isChecking = false;

    async function checkAndBlock(): Promise<void> {
      if (isChecking || shouldSkipUrl(currentUrl)) {
        return;
      }
      
      isChecking = true;

      try {
        const response = await browser.runtime.sendMessage({
          type: 'CHECK_BLOCK',
          url: currentUrl
        }) as CheckBlockResponse;

        if (response?.shouldBlock) {
          const blockPageUrl = buildBlockPageUrl(response);
          location.href = blockPageUrl;
        }
      } catch (error) {
        console.error('Error checking block status:', error);
      } finally {
        isChecking = false;
      }
    }

    function monitorUrlChanges(): void {
      const newUrl = location.href;
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        checkAndBlock();
      }
    }

    function setupEventListeners(): void {
      window.addEventListener('popstate', () => {
        setTimeout(monitorUrlChanges, URL_MONITORING.EVENT_DELAY);
      });

      window.addEventListener('hashchange', () => {
        setTimeout(monitorUrlChanges, URL_MONITORING.EVENT_DELAY);
      });
    }

    function setupMutationObserver(): void {
      const observer = new MutationObserver(() => {
        setTimeout(monitorUrlChanges, URL_MONITORING.EVENT_DELAY);
      });

      const startObserving = () => {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
      } else {
        startObserving();
      }

      window.addEventListener('beforeunload', () => {
        observer.disconnect();
      });
    }

    function startPeriodicCheck(): void {
      setInterval(monitorUrlChanges, URL_MONITORING.POLLING_INTERVAL);
    }

    checkAndBlock();
    setupEventListeners();
    setupMutationObserver();
    startPeriodicCheck();

  },
});
