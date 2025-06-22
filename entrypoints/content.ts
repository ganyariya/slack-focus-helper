export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    console.log('Slack Focus Helper content script loaded');

    let currentUrl = location.href;
    let isChecking = false;

    async function checkAndBlock() {
      if (isChecking) return;
      isChecking = true;

      try {
        const response = await browser.runtime.sendMessage({
          type: 'CHECK_BLOCK',
          url: currentUrl
        });

        if (response && response.shouldBlock) {
          const blockPageUrl = `${browser.runtime.getURL('')}block.html` + 
            `?group=${encodeURIComponent(response.groupName || '')}` +
            `&time=${encodeURIComponent(response.currentTime || '')}` +
            `&url=${encodeURIComponent(response.matchedUrl || '')}`;
          
          location.href = blockPageUrl;
        }
      } catch (error) {
        console.error('Error checking block status:', error);
      } finally {
        isChecking = false;
      }
    }

    // Initial check
    checkAndBlock();

    // Monitor URL changes for SPAs
    function monitorUrlChanges() {
      const newUrl = location.href;
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        checkAndBlock();
      }
    }

    // History API監視 (popstate events)
    window.addEventListener('popstate', () => {
      setTimeout(monitorUrlChanges, 100);
    });

    // Hash change監視 (hashchange events)
    window.addEventListener('hashchange', () => {
      setTimeout(monitorUrlChanges, 100);
    });

    // DOM mutation監視
    const observer = new MutationObserver(() => {
      setTimeout(monitorUrlChanges, 100);
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    } else {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // 定期的なURL変更チェック (1秒間隔)
    setInterval(monitorUrlChanges, 1000);

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
    });
  },
});
