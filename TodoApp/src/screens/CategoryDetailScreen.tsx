import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { database } from '../database';
import Category from '../database/models/Category';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

export default function CategoryDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const categoryId = route.params?.categoryId;

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (categoryId) {
      database.get<Category>('categories').find(categoryId).then(c => {
        setCategory(c);
        setName(c.name);
        setColor(c.color || COLORS[0]);
      }).catch(console.error);
    }
  }, [categoryId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error', 'Error'), t('category.nameRequired', 'Name is required'));
      return;
    }

    try {
      await database.write(async () => {
        if (category) {
          await category.update(c => {
            c.name = name;
            c.color = color;
          });
        } else {
          await database.get<Category>('categories').create(c => {
            c.name = name;
            c.color = color;
            c.sortOrder = Date.now();
          });
        }
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-[#111] p-4">
      <Text className="text-gray-500 mb-1">{t('category.name', 'Category Name')}</Text>
      <TextInput
        className="bg-gray-100 dark:bg-[#222] p-3 rounded-lg mb-6 text-black dark:text-white"
        value={name}
        onChangeText={setName}
        placeholder={t('category.namePlaceholder', 'e.g. Work, Personal')}
        placeholderTextColor="#9ca3af"
      />

      <Text className="text-gray-500 mb-2">{t('category.color', 'Color')}</Text>
      <View className="flex-row flex-wrap mb-8">
        {COLORS.map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            className="w-12 h-12 rounded-full m-2 items-center justify-center"
            style={{ backgroundColor: c, borderWidth: color === c ? 4 : 0, borderColor: '#fff' }}
          />
        ))}
      </View>

      <TouchableOpacity 
        onPress={handleSave}
        className="bg-blue-600 p-4 rounded-xl items-center"
      >
        <Text className="text-white font-bold text-lg">{t('common.save', 'Save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
