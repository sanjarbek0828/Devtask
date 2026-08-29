import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'icon', type: 'string' },
      ]
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'priority', type: 'string' },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'reminder_time', type: 'number', isOptional: true },
        { name: 'is_completed', type: 'boolean' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sort_order', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'subtasks',
      columns: [
        { name: 'task_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'is_completed', type: 'boolean' },
      ]
    })
  ]
})
