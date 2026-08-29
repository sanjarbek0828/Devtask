import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
      className="bg-blue-600 dark:bg-blue-500"
    >
      <Plus color="#fff" size={28} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
