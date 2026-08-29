/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';
import './src/locales';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.BOOT_COMPLETED) {
    // Reschedule notifications here if necessary.
    // Notifee automatically handles trigger notifications on reboot for Android!
  }
});

AppRegistry.registerComponent(appName, () => App);
