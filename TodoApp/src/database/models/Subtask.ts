import { Model, Relation } from '@nozbe/watermelondb'
import { field, relation, text } from '@nozbe/watermelondb/decorators'
import type Task from './Task'

export default class Subtask extends Model {
  static table = 'subtasks'

  @text('title') title!: string
  @field('is_completed') isCompleted!: boolean

  @relation('tasks', 'task_id') task!: Relation<Task>
}
