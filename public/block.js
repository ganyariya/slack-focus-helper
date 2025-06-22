// WXT/Chrome Extension API の統一
const extensionAPI = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;

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
document.getElementById('settings-link').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        if (extensionAPI && extensionAPI.runtime) {
            // Background scriptに設定画面を開くよう要求
            const response = await extensionAPI.runtime.sendMessage({ 
                type: 'OPEN_SETTINGS' 
            });
            
            if (!response?.success) {
                throw new Error(response?.error || 'Failed to open settings');
            }
        }
    } catch (error) {
        console.log('Failed to open settings:', error);
        // フォールバック：現在のタブでポップアップページを開く
        try {
            if (extensionAPI && extensionAPI.runtime) {
                window.location.href = extensionAPI.runtime.getURL('popup.html');
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
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
        if (extensionAPI && extensionAPI.runtime) {
            const response = await extensionAPI.runtime.sendMessage({
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