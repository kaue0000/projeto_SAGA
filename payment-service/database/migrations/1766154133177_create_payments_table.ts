import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // ADICIONAR ESTE CAMPO (Vem do serviço de pedidos)
      table.integer('order_id').notNullable()
      // ID do cliente (pode vir de outro serviço)
      table.integer('user_id').notNullable()

      // Valor do pagamento (Decimal: 12 digitos total, 2 casas decimais)
      table.decimal('amount', 12, 2).notNullable()

      // Status: pending, approved, rejected, refunded
      table.string('status').defaultTo('pending')

      // Método: pix, credit_card, boleto
      table.string('method').notNullable()

      // ID da transação externa (ex: Stripe, Pagar.me)
      table.string('transaction_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
