import { Model, Query, Relation } from '@nozbe/watermelondb'
import { children, date, field, readonly, relation, text } from '@nozbe/watermelondb/decorators'
import type Category from './Category'
import type Subtask from './Subtask'

export type Priority = 'low' | 'medium' | 'high'

export default class Task extends Model {
  static table = 'tasks'

  static associations = {
    subtasks: { type: 'has_many' as const, foreignKey: 'task_id' },
  }

  @text('title') title!: string
  @text('description') description?: string
  
  @relation('categories', 'category_id') category!: Relation<Category>
  @text('priority') priority!: Priority
  
  @date('due_date') dueDate?: Date
  @date('reminder_time') reminderTime?: Date
  
  @field('is_completed') isCompleted!: boolean
  @date('completed_at') completedAt?: Date
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  
  @field('sort_order') sortOrder!: number

  @children('subtasks') subtasks!: Query<Subtask>
}
