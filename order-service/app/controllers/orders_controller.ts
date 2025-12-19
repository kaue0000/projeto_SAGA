// app/controllers/orders_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import RabbitMQService from '#services/rabbitmq_service'

export default class OrdersController {
  
  public async store({ request, response }: HttpContext) {
    // 1. Receber dados
    const data = request.only(['amount'])

    // 2. Criar registro no Banco
    const order = new Order()
    order.amount = data.amount
    order.status = 'PENDING'
    await order.save()

    // 3. Enviar para a Fila (RabbitMQ)
    await RabbitMQService.publish('order_created', {
      id: order.id,
      amount: order.amount,
      status: order.status
    })

    // 4. Responder ao usuário
    return response.created(order)
  }
}