import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Slack Focus Helper',
    description: 'A browser extension to help you focus by temporarily hiding distracting Slack channels and sections during work hours.',
    version: '1.0.0',
    permissions: [
      'storage',
      'tabs',
      'scripting'
    ],
    host_permissions: [
      '*://*.slack.com/*'
    ]
  }
});
