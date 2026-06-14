import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urujeni.app',
  appName: 'Urujeni',
  webDir: 'build',
  server: {
    allowNavigation: ['urujeni-backend.onrender.com']
  }
};

export default config;
