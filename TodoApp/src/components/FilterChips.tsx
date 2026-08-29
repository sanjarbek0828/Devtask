import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';

export type FilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'high_priority';

interface FilterChipsProps {
  activeFilter: FilterType;
  onSelect: (filter: FilterType) => void;
}

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'high_priority', label: 'High Priority' },
];

export default function FilterChips({ activeFilter, onSelect }: FilterChipsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2 bg-[#f5f5f5] dark:bg-black max-h-12 border-b border-gray-200 dark:border-gray-800"
    >
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onSelect(filter.id)}
          className={`mr-2 px-4 py-1.5 rounded-full border ${
            activeFilter === filter.id 
              ? 'bg-blue-600 border-blue-600' 
              : 'bg-white dark:bg-[#222] border-gray-300 dark:border-gray-700'
          }`}
        >
          <Text 
            className={`font-medium ${
              activeFilter === filter.id 
                ? 'text-white' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
