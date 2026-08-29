import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Platform } from 'react-native'

import schema from './schema'
import migrations from './migrations'
import Task from './models/Task'
import Subtask from './models/Subtask'
import Category from './models/Category'

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out once database is filled with data)
  migrations,
  // (optional database name or file system path)
  // dbName: 'myapp',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: Platform.OS === 'ios', 
  // (optional, but you should implement this method)
  onSetUpError: error => {
    // Database failed to load -- offer the user to reload the app or log out
  }
})

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [
    Task,
    Subtask,
    Category,
  ],
})
