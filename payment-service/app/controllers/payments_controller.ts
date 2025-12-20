import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import { createPaymentValidator } from '#validators/payment'
import RabbitMQService from '../../services/rabbitmq_service.js'

export default class PaymentsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPaymentValidator)

    const payment = await Payment.create(payload)

    // Publica evento para o broker após criar o pagamento
    try {
      const eventPayload = {
        orderId: payment.orderId,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        userId: payment.userId,
      }

      if (payment.status === 'approved') {
        await RabbitMQService.publish('payment_approved', eventPayload)
      } else if (payment.status === 'declined' || payment.status === 'rejected') {
        await RabbitMQService.publish('payment_declined', eventPayload)
      } else {
        await RabbitMQService.publish('payment_created', eventPayload)
      }
    } catch (err) {
      console.error('Erro ao publicar evento no RabbitMQ:', err)
    }

    return response.status(201).json(payment)
  }
}
