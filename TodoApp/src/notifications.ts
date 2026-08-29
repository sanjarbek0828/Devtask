import notifee, { TriggerType, TimestampTrigger, AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

export async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

export async function createChannel() {
  return await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleTaskReminder(taskId: string, title: string, body: string, timestamp: number) {
  const channelId = await createChannel();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: timestamp, 
  };

  await notifee.createTriggerNotification(
    {
      id: taskId,
      title: title,
      body: body,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Default React Native icon
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );
}

export async function cancelTaskReminder(taskId: string) {
  await notifee.cancelNotification(taskId);
}
