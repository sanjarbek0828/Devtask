import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigation from './src/navigation';
import './src/locales'; // Initialize i18n
import { database } from './src/database';
import { requestNotificationPermission } from './src/notifications';

export default function App() {
  // Optional: Run a quick connection test on boot
  useEffect(() => {
    database.get('tasks').query().fetchCount().then(c => {
      console.log(`Database connected. Current task count: ${c}`);
    }).catch(e => {
      console.error('Database connection error:', e);
    });

    requestNotificationPermission().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
