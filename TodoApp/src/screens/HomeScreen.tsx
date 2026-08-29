import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { database } from '../database';
import Task from '../database/models/Task';
import withObservables from '@nozbe/with-observables';
import TaskItem from '../components/TaskItem';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import FilterChips, { FilterType } from '../components/FilterChips';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Search } from 'lucide-react-native';
import { isToday, isFuture, isPast } from 'date-fns';

interface HomeScreenProps {
  tasks: Task[];
}

function HomeScreen({ tasks }: HomeScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // Simulate network/refresh
  }, []);

  const handleToggle = async (task: Task) => {
    await database.write(async () => {
      await task.update(t => {
        t.isCompleted = !t.isCompleted;
        t.completedAt = t.isCompleted ? new Date() : undefined;
      });
    });
  };

  const handleDelete = async (task: Task) => {
    await database.write(async () => {
      await task.destroyPermanently();
    });
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    switch (filter) {
      case 'today':
        result = result.filter(t => t.dueDate && isToday(t.dueDate));
        break;
      case 'upcoming':
        result = result.filter(t => t.dueDate && isFuture(t.dueDate) && !isToday(t.dueDate));
        break;
      case 'overdue':
        result = result.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate) && !t.isCompleted);
        break;
      case 'high_priority':
        result = result.filter(t => t.priority === 'high');
        break;
    }

    return result;
  }, [tasks, search, filter]);

  return (
    <View className="flex-1 bg-[#f5f5f5] dark:bg-black">
      <View className="px-4 py-3 bg-white dark:bg-[#111] shadow-sm flex-row items-center border-b border-gray-200 dark:border-gray-800">
        <Search color="#9ca3af" size={20} />
        <TextInput
          className="flex-1 ml-2 text-black dark:text-white"
          placeholder={t('home.search')}
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      
      <FilterChips activeFilter={filter} onSelect={setFilter} />

      <Animated.FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPress={(task) => navigation.navigate('TaskDetail', { taskId: task.id })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState 
            title={search ? t('home.emptySearch', 'No tasks found') : t('home.empty', 'No tasks yet')}
            description={t('home.emptyDesc', 'Tap the + button to create one')}
          />
        }
      />
      
      <FAB onPress={() => navigation.navigate('TaskDetail', {})} />
    </View>
  );
}

const enhance = withObservables([], () => ({
  tasks: database.collections
    .get<Task>('tasks')
    .query(Q.sortBy('sort_order', Q.asc))
    .observe(),
}));

export default enhance(HomeScreen);
