import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { database } from '../database';
import Task, { Priority } from '../database/models/Task';
import Category from '../database/models/Category';
import Subtask from '../database/models/Subtask';
import { Plus, X, Calendar as CalendarIcon, Bell } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleTaskReminder, cancelTaskReminder } from '../notifications';
import { format } from 'date-fns';

export default function TaskDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [task, setTask] = useState<Task | null>(null);
  
  const [subtasks, setSubtasks] = useState<{ id?: string, title: string, isCompleted: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // New states for date and category
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remindMe, setRemindMe] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    database.get<Category>('categories').query().fetch().then(setCategories);

    if (taskId) {
      database.get<Task>('tasks').find(taskId).then(async t => {
        setTask(t);
        setTitle(t.title);
        setDescription(t.description || '');
        setPriority(t.priority);
        setDueDate(t.dueDate);
        setRemindMe(t.hasReminder);
        if (t.category.id) setSelectedCategoryId(t.category.id);
        
        const existingSubtasks = await t.subtasks.fetch();
        setSubtasks(existingSubtasks.map(st => ({
          id: st.id,
          title: st.title,
          isCompleted: st.isCompleted
        })));
      }).catch(console.error);
    }
  }, [taskId]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim(), isCompleted: false }]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error', 'Error'), t('task.titleRequired', 'Title is required'));
      return;
    }

    try {
      let savedTaskId = taskId;
      
      await database.write(async () => {
        let savedTask = task;
        if (savedTask) {
          await savedTask.update(t => {
            t.title = title;
            t.description = description;
            t.priority = priority;
            t.dueDate = dueDate;
            t.hasReminder = remindMe;
            if (selectedCategoryId) t.category.id = selectedCategoryId;
            else t.category.id = undefined as any; // hack to clear relation
          });
        } else {
          savedTask = await database.get<Task>('tasks').create(t => {
            t.title = title;
            t.description = description;
            t.priority = priority;
            t.dueDate = dueDate;
            t.hasReminder = remindMe;
            t.isCompleted = false;
            t.sortOrder = Date.now();
            if (selectedCategoryId) t.category.id = selectedCategoryId;
          });
          savedTaskId = savedTask.id;
        }

        if (task) {
          const existingSubtasks = await task.subtasks.fetch();
          for (const st of existingSubtasks) {
            await st.destroyPermanently();
          }
        }

        const subtasksCollection = database.get<Subtask>('subtasks');
        for (const st of subtasks) {
          await subtasksCollection.create(subRecord => {
            subRecord.task.set(savedTask!);
            subRecord.title = st.title;
            subRecord.isCompleted = st.isCompleted;
          });
        }
      });

      // Handle Notifications outside the database transaction
      if (remindMe && dueDate) {
        await scheduleTaskReminder(savedTaskId, title, description || t('task.reminder', 'Task reminder'), dueDate.getTime());
      } else {
        await cancelTaskReminder(savedTaskId);
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-[#111] p-4">
      <Text className="text-gray-500 mb-1">{t('task.title', 'Task Title')}</Text>
      <TextInput
        className="bg-gray-100 dark:bg-[#222] p-3 rounded-xl mb-4 text-black dark:text-white border border-gray-200 dark:border-gray-800 focus:border-blue-500"
        value={title}
        onChangeText={setTitle}
        placeholder={t('task.titlePlaceholder', 'e.g. Buy groceries')}
        placeholderTextColor="#9ca3af"
      />

      <Text className="text-gray-500 mb-1">{t('task.description', 'Description')}</Text>
      <TextInput
        className="bg-gray-100 dark:bg-[#222] p-3 rounded-xl mb-6 text-black dark:text-white border border-gray-200 dark:border-gray-800 focus:border-blue-500"
        value={description}
        onChangeText={setDescription}
        placeholder={t('task.descPlaceholder', 'Additional details...')}
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      
      {/* Due Date & Reminder */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-500">{t('task.dueDate', 'Due Date')}</Text>
      </View>
      <View className="flex-row items-center mb-6">
        <TouchableOpacity 
          className="flex-1 flex-row items-center bg-gray-100 dark:bg-[#222] p-3 rounded-xl border border-gray-200 dark:border-gray-800"
          onPress={() => setShowDatePicker(true)}
        >
          <CalendarIcon color="#3b82f6" size={20} />
          <Text className="ml-2 text-black dark:text-white">
            {dueDate ? format(dueDate, 'MMM d, yyyy - HH:mm') : t('task.noDate', 'Select date & time')}
          </Text>
        </TouchableOpacity>
        
        {dueDate && (
          <View className="flex-row items-center ml-4">
            <Bell color={remindMe ? '#3b82f6' : '#9ca3af'} size={20} />
            <Switch 
              value={remindMe} 
              onValueChange={setRemindMe} 
              trackColor={{ false: '#767577', true: '#93c5fd' }}
              thumbColor={remindMe ? '#3b82f6' : '#f4f3f4'}
              className="ml-2"
            />
          </View>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Category Selector */}
      {categories.length > 0 && (
        <View className="mb-6">
          <Text className="text-gray-500 mb-2">{t('task.category', 'Category')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(undefined)}
              className={`mr-2 px-4 py-2 rounded-full border ${!selectedCategoryId ? 'bg-gray-800 border-gray-800' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
            >
              <Text className={!selectedCategoryId ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>None</Text>
            </TouchableOpacity>
            
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCategoryId(c.id)}
                className={`mr-2 px-4 py-2 rounded-full flex-row items-center border ${selectedCategoryId === c.id ? 'border-2' : 'border-gray-300 dark:border-gray-700'}`}
                style={{ borderColor: selectedCategoryId === c.id ? c.color : undefined, backgroundColor: selectedCategoryId === c.id ? `${c.color}20` : 'transparent' }}
              >
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                <Text className={selectedCategoryId === c.id ? 'text-black dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400'}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text className="text-gray-500 mb-1">{t('task.priority', 'Priority')}</Text>
      <View className="flex-row space-x-2 mb-6">
        {(['low', 'medium', 'high'] as Priority[]).map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p)}
            className={`flex-1 p-3 mx-1 rounded-xl items-center ${
              priority === p ? 'bg-blue-600' : 'bg-gray-100 dark:bg-[#222]'
            }`}
          >
            <Text className={priority === p ? 'text-white font-medium' : 'text-gray-700 dark:text-gray-300 capitalize'}>
              {t(`priorities.${p}`, p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-500 mb-2">{t('task.subtasks', 'Subtasks')}</Text>
      <View className="mb-6">
        {subtasks.map((st, index) => (
          <View key={index} className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-xl mb-2 border border-gray-200 dark:border-gray-800">
            <Text className="flex-1 text-black dark:text-white">{st.title}</Text>
            <TouchableOpacity onPress={() => handleRemoveSubtask(index)} className="p-1">
              <X color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
        ))}
        <View className="flex-row items-center mt-2">
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-[#222] p-3 rounded-xl text-black dark:text-white mr-2 border border-gray-200 dark:border-gray-800"
            value={newSubtask}
            onChangeText={setNewSubtask}
            placeholder={t('task.addSubtask', 'Add a subtask...')}
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleAddSubtask}
          />
          <TouchableOpacity onPress={handleAddSubtask} className="bg-blue-600 p-3 rounded-xl">
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleSave}
        className="bg-blue-600 p-4 rounded-xl items-center mb-10 shadow-sm"
      >
        <Text className="text-white font-bold text-lg">{t('common.save', 'Save Task')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
