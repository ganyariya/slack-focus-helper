// URLパラメータから情報を取得
const urlParams = new URLSearchParams(window.location.search);
const groupName = urlParams.get('group') || '不明なグループ';
const currentTime = urlParams.get('time') || '-';
const blockedUrl = urlParams.get('url') || '-';

// 情報を表示
document.getElementById('group-name').textContent = groupName;
document.getElementById('current-time').textContent = currentTime;
document.getElementById('blocked-url').textContent = blockedUrl;

// 設定リンクをポップアップに設定
document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome && chrome.runtime) {
        chrome.runtime.openOptionsPage?.() || 
        chrome.tabs?.create({ url: chrome.runtime.getURL('popup.html') }) ||
        window.close();
    }
});

// リアルタイム時計
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('live-time').textContent = timeString;
}

updateTime();
setInterval(updateTime, 1000);

// 5秒ごとにブロック状態を再チェック
setInterval(async () => {
    try {
        if (browser && browser.runtime) {
            const response = await browser.runtime.sendMessage({
                type: 'CHECK_BLOCK',
                url: blockedUrl
            });
            
            if (response && !response.shouldBlock) {
                // ブロックが解除された場合、元のURLに戻る
                window.location.href = blockedUrl;
            }
        }
    } catch (error) {
        console.log('Block check failed:', error);
    }
}, 5000);