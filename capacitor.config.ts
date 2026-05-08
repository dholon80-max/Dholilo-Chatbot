import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dholilo.chatbot',
  appName: 'Dholilo Chatbot',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
