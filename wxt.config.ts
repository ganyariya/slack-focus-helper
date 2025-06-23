import { defineConfig } from 'wxt';
import { KEYBOARD_SHORTCUTS } from './utils/constants';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: [
      'storage',
      'activeTab',
      'tabs',
      'scripting'
    ],
    host_permissions: [
      '<all_urls>'
    ],
    name: 'Slack Focus Helper',
    description: '指定した時間帯に特定のWebサイトへのアクセスをブロックするChrome拡張機能',
    version: '0.1.0',
    action: {
      default_popup: 'popup.html'
    },
    commands: {
      "add-current-url": {
        suggested_key: {
          default: KEYBOARD_SHORTCUTS.ADD_CURRENT_URL
        },
        description: "現在のURLを追加"
      }
    }
  }
});
