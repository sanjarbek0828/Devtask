import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import type Task from '../database/models/Task';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onPress, onDelete }: TaskItemProps) {
  const { t } = useTranslation();

  const renderRightActions = () => {
    return (
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task)}
        activeOpacity={0.8}
      >
        <Trash2 color="#fff" size={24} />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => onPress(task)}
          className="flex-row items-center p-4 bg-white dark:bg-[#1a1a1a] shadow-sm mb-[1px]"
        >
          <TouchableOpacity onPress={() => onToggle(task)} className="mr-3" hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            {task.isCompleted ? (
              <CheckCircle2 color="#10b981" size={24} />
            ) : (
              <Circle color="#6b7280" size={24} />
            )}
          </TouchableOpacity>
          
          <View className="flex-1 justify-center">
            <Text 
              className={`text-base font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}
            >
              {task.title}
            </Text>
            {task.dueDate && (
              <Text className="text-xs text-gray-500 mt-1">
                {format(task.dueDate, 'MMM d, yyyy - HH:mm')}
              </Text>
            )}
          </View>

          <View className={`ml-2 px-2 py-1 rounded-md ${
            task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
            task.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <Text className={`text-[10px] uppercase font-bold tracking-wider ${
              task.priority === 'high' ? 'text-red-700 dark:text-red-400' :
              task.priority === 'medium' ? 'text-orange-700 dark:text-orange-400' :
              'text-blue-700 dark:text-blue-400'
            }`}>
              {t(`priorities.${task.priority}`)}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 1,
  },
});
