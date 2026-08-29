import React from 'react';
import { View, Text } from 'react-native';
import { CheckSquare } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 mt-10">
      <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
        <CheckSquare color="#9ca3af" size={48} />
      </View>
      <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-500 text-center">
          {description}
        </Text>
      )}
    </View>
  );
}
