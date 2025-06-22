interface BlockCheckResponse {
  shouldBlock: boolean;
  groupName?: string;
  currentTime?: string;
  matchedUrl?: string;
}

function shouldSkipUrl(url: string): boolean {
  return !url || 
         url.startsWith('chrome://') || 
         url.startsWith('moz-extension://') ||
         url.startsWith('chrome-extension://');
}

function buildBlockPageUrl(response: BlockCheckResponse): string {
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
    console.log('Slack Focus Helper content script loaded');

    let currentUrl = location.href;
    let isChecking = false;

    async function checkAndBlock(): Promise<void> {
      if (isChecking || shouldSkipUrl(currentUrl)) {
        return;
      }
      
      isChecking = true;

      try {
        const response: BlockCheckResponse = await browser.runtime.sendMessage({
          type: 'CHECK_BLOCK',
          url: currentUrl
        });

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
        setTimeout(monitorUrlChanges, 100);
      });

      window.addEventListener('hashchange', () => {
        setTimeout(monitorUrlChanges, 100);
      });
    }

    function setupMutationObserver(): void {
      const observer = new MutationObserver(() => {
        setTimeout(monitorUrlChanges, 100);
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
      setInterval(monitorUrlChanges, 1000);
    }

    checkAndBlock();
    setupEventListeners();
    setupMutationObserver();
    startPeriodicCheck();

  },
});
