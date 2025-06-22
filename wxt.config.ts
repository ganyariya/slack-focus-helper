import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: [
      'storage',
      'activeTab',
      'tabs'
    ],
    host_permissions: [
      '<all_urls>'
    ],
    name: 'Slack Focus Helper',
    description: '指定した時間帯に特定のWebサイトへのアクセスをブロックするChrome拡張機能',
    version: '0.1.0'
  }
});
