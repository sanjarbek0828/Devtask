import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { database } from '../database';
import Task from '../database/models/Task';
import Category from '../database/models/Category';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { CheckCircle2, Circle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface StatisticsScreenProps {
  tasks: Task[];
  categories: Category[];
}

function StatisticsScreen({ tasks, categories }: StatisticsScreenProps) {
  const { t } = useTranslation();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Group tasks by category
  const categoryStats = categories.map(cat => {
    // We are observing tasks in this view, so we can just filter them in memory
    const catTasks = tasks.filter(t => t.category.id === cat.id);
    const catTotal = catTasks.length;
    const percentage = totalTasks === 0 ? 0 : Math.round((catTotal / totalTasks) * 100);
    return { ...cat, total: catTotal, percentage };
  }).sort((a, b) => b.total - a.total); // Sort by most tasks

  const uncategorizedTasks = tasks.filter(t => !t.category.id).length;
  if (uncategorizedTasks > 0) {
    const percentage = totalTasks === 0 ? 0 : Math.round((uncategorizedTasks / totalTasks) * 100);
    categoryStats.push({
      id: 'uncategorized',
      name: t('task.uncategorized', 'Uncategorized'),
      color: '#9ca3af',
      total: uncategorizedTasks,
      percentage
    } as any);
  }

  return (
    <ScrollView className="flex-1 bg-[#f5f5f5] dark:bg-black p-4">
      <Animated.View entering={FadeInUp.delay(100)} className="bg-blue-600 rounded-3xl p-8 mb-6 items-center shadow-lg shadow-blue-500/30">
        <Text className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">
          {t('statistics.completionRate', 'Completion Rate')}
        </Text>
        <Text className="text-white text-6xl font-bold">
          {completionRate}%
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl mr-2 items-center shadow-sm border border-gray-100 dark:border-gray-800">
          <CheckCircle2 color="#10b981" size={36} />
          <Text className="text-3xl font-bold text-black dark:text-white mt-3">{completedTasks}</Text>
          <Text className="text-gray-500 text-xs uppercase font-medium mt-1">{t('statistics.completed', 'Completed')}</Text>
        </View>

        <View className="flex-1 bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl ml-2 items-center shadow-sm border border-gray-100 dark:border-gray-800">
          <Circle color="#f59e0b" size={36} />
          <Text className="text-3xl font-bold text-black dark:text-white mt-3">{pendingTasks}</Text>
          <Text className="text-gray-500 text-xs uppercase font-medium mt-1">{t('statistics.pending', 'Pending')}</Text>
        </View>
      </Animated.View>
      
      <Animated.Text entering={FadeInUp.delay(300)} className="text-lg font-bold text-black dark:text-white mb-4 ml-1">
        {t('statistics.byCategory', 'Categories Distribution')}
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(400)} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 p-2 mb-10">
        {categoryStats.map((cat, index) => (
          <View key={cat.id} className={`p-4 ${index !== categoryStats.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                <Text className="text-base text-black dark:text-white font-medium">{cat.name}</Text>
              </View>
              <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {cat.total} <Text className="text-gray-400 font-normal">({cat.percentage}%)</Text>
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full" 
                style={{ 
                  width: `${cat.percentage}%`, 
                  backgroundColor: cat.color || '#3b82f6' 
                }} 
              />
            </View>
          </View>
        ))}
        {categoryStats.length === 0 && (
          <Text className="text-center text-gray-500 py-6">{t('statistics.noData', 'No tasks available for statistics')}</Text>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const enhance = withObservables([], () => ({
  tasks: database.collections.get<Task>('tasks').query().observe(),
  categories: database.collections.get<Category>('categories').query().observe(),
}));

export default enhance(StatisticsScreen);
