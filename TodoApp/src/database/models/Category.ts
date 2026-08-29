import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

export default class Category extends Model {
  static table = 'categories'

  @text('name') name!: string
  @text('color') color!: string
  @text('icon') icon!: string
}
