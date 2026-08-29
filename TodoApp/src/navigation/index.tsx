import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { ListTodo, PieChart, Settings2, FolderKanban } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import { useAppStore } from '../store';

export type RootStackParamList = {
  Tabs: undefined;
  TaskDetail: { taskId?: string };
  CategoryDetail: { categoryId?: string };
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { t } = useTranslation();
  const theme = useAppStore(state => state.theme);
  const isDark = theme === 'dark' || (theme === 'system' /* you can add useColorScheme here */);

  const colors = {
    active: isDark ? '#fff' : '#000',
    inactive: isDark ? '#666' : '#999',
    background: isDark ? '#000' : '#fff',
    card: isDark ? '#111' : '#f8f8f8',
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: isDark ? '#333' : '#eee',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: t('home.title'),
          tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{
          tabBarLabel: t('task.categories', 'Categories'),
          tabBarIcon: ({ color, size }) => <FolderKanban color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen} 
        options={{
          tabBarLabel: t('home.statistics', 'Statistics'),
          tabBarIcon: ({ color, size }) => <PieChart color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const theme = useAppStore(state => state.theme);
  const isDark = theme === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#111' : '#fff',
          },
          headerTintColor: isDark ? '#fff' : '#000',
        }}
      >
        <Stack.Screen 
          name="Tabs" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetailScreen} 
          options={{ title: 'Task Details' }} 
        />
        <Stack.Screen 
          name="CategoryDetail" 
          component={CategoryDetailScreen} 
          options={{ title: 'Category Details' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
