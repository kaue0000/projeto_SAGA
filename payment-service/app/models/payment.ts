import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'order_id' })
  declare orderId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare amount: number

  @column()
  declare status: string

  @column()
  declare method: string

  // O transactionId pode ser nulo, então usamos '| null'
  @column({ columnName: 'transaction_id' })
  declare transactionId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
