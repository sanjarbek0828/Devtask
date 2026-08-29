import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { database } from '../database';
import Category from '../database/models/Category';
import withObservables from '@nozbe/with-observables';
import { Plus, X, Tag } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

interface CategoriesScreenProps {
  categories: Category[];
}

function CategoriesScreen({ categories }: CategoriesScreenProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setColor(category.color);
    } else {
      setEditingCategory(null);
      setName('');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error', 'Error'), t('category.nameRequired', 'Category name is required'));
      return;
    }

    try {
      await database.write(async () => {
        if (editingCategory) {
          await editingCategory.update(c => {
            c.name = name;
            c.color = color;
          });
        } else {
          await database.get<Category>('categories').create(c => {
            c.name = name;
            c.color = color;
          });
        }
      });
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert(t('common.error', 'Error'), error.message);
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      t('common.delete', 'Delete'),
      t('category.deleteWarning', 'Are you sure you want to delete this category? Tasks in this category will become uncategorized.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { 
          text: t('common.delete', 'Delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await category.destroyPermanently();
              });
            } catch (err: any) {
              Alert.alert(t('common.error', 'Error'), err.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#f5f5f5] dark:bg-black p-4">
      <ScrollView className="flex-1">
        <Animated.View layout={Layout.springify()}>
          {categories.map((cat, index) => (
            <Animated.View 
              entering={FadeInUp.delay(index * 100)}
              exiting={FadeOutDown}
              layout={Layout.springify()}
              key={cat.id} 
              className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-3 flex-row items-center justify-between shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <TouchableOpacity 
                className="flex-row items-center flex-1"
                onPress={() => handleOpenModal(cat)}
              >
                <View className="w-10 h-10 rounded-full mr-4 items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                  <Tag color={cat.color} size={20} />
                </View>
                <Text className="text-lg font-bold text-black dark:text-white">{cat.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(cat)} className="p-2" hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <X color="#ef4444" size={20} />
              </TouchableOpacity>
            </Animated.View>
          ))}
          {categories.length === 0 && (
            <View className="items-center justify-center mt-20 opacity-50">
              <Tag color="#9ca3af" size={48} />
              <Text className="text-gray-500 mt-4 text-center">{t('category.empty', 'No categories yet. Create one!')}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => handleOpenModal()}
        className="bg-blue-600 w-16 h-16 rounded-full absolute bottom-6 right-6 items-center justify-center shadow-lg shadow-blue-500/50"
      >
        <Plus color="#fff" size={32} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-[#1a1a1a] p-6 rounded-t-3xl min-h-[400px]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black dark:text-white">
                {editingCategory ? t('category.edit', 'Edit Category') : t('category.new', 'New Category')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 mb-2 font-medium">{t('category.name', 'Category Name')}</Text>
            <TextInput
              className="bg-gray-100 dark:bg-[#222] p-4 rounded-2xl mb-6 text-black dark:text-white text-lg border border-gray-200 dark:border-gray-800"
              value={name}
              onChangeText={setName}
              placeholder={t('category.namePlaceholder', 'e.g. Work')}
              placeholderTextColor="#9ca3af"
              autoFocus
            />

            <Text className="text-gray-500 mb-3 font-medium">{t('category.color', 'Color')}</Text>
            <View className="flex-row flex-wrap mb-8 justify-between">
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-12 h-12 rounded-full m-1 items-center justify-center ${color === c ? 'border-4 border-gray-300 dark:border-gray-600' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              className="bg-blue-600 p-4 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-bold text-lg">{t('common.save', 'Save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const enhance = withObservables([], () => ({
  categories: database.collections.get<Category>('categories').query().observe(),
}));

export default enhance(CategoriesScreen);
