import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { Trash2, Moon, Sun, Globe, Download, Github } from 'lucide-react-native';
import { database } from '../database';
import Animated, { FadeInLeft, FadeInUp } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, setDarkMode, language, setLanguage } = useStore();

  const handleClearData = () => {
    Alert.alert(
      t('settings.clearData', 'Clear All Data'),
      t('settings.clearDataWarning', 'Are you sure you want to delete all tasks and categories? This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { 
          text: t('common.delete', 'Delete'), 
          style: 'destructive',
          onPress: async () => {
            await database.write(async () => {
              await database.unsafeResetDatabase();
            });
            Alert.alert(t('common.success', 'Success'), t('settings.dataCleared', 'All data has been cleared.'));
          }
        }
      ]
    );
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ScrollView className="flex-1 bg-[#f5f5f5] dark:bg-black p-4">
      <Animated.Text entering={FadeInLeft.delay(100)} className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2 mt-4">
        {t('settings.appearance', 'Appearance')}
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(200)} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
              {isDarkMode ? <Moon color="#3b82f6" size={20} /> : <Sun color="#3b82f6" size={20} />}
            </View>
            <Text className="text-base text-black dark:text-white font-medium">{t('settings.darkMode', 'Dark Mode')}</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={setDarkMode}
            trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
            thumbColor={isDarkMode ? '#3b82f6' : '#ffffff'}
          />
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInLeft.delay(300)} className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">
        {t('settings.language', 'Language')}
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(400)} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-8 p-2">
        {(['en', 'ru', 'uz'] as const).map((lang, index) => (
          <TouchableOpacity
            key={lang}
            onPress={() => changeLanguage(lang)}
            className={`p-4 flex-row items-center justify-between ${
              index !== 2 ? 'border-b border-gray-100 dark:border-gray-800' : ''
            }`}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#222] items-center justify-center mr-4">
                <Globe color={language === lang ? '#3b82f6' : '#9ca3af'} size={20} />
              </View>
              <Text className={`text-base font-medium ${language === lang ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-white'}`}>
                {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : 'Oʻzbekcha'}
              </Text>
            </View>
            {language === lang && (
              <View className="w-3 h-3 rounded-full bg-blue-600" />
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      <Animated.Text entering={FadeInLeft.delay(500)} className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">
        {t('settings.data', 'Data & Storage')}
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(600)} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-10">
        <TouchableOpacity
          onPress={handleClearData}
          className="p-5 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
              <Trash2 color="#ef4444" size={20} />
            </View>
            <Text className="text-base text-red-600 dark:text-red-400 font-medium">{t('settings.clearData', 'Clear All Data')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-5 flex-row items-center justify-between"
          onPress={() => Alert.alert('Export', 'Feature coming soon!')}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
              <Download color="#10b981" size={20} />
            </View>
            <Text className="text-base text-black dark:text-white font-medium">{t('settings.exportData', 'Export Data')}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(700)} className="items-center mb-10 opacity-60">
        <Github color="#9ca3af" size={32} />
        <Text className="text-gray-500 text-xs mt-2">TodoApp v1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
}
