import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import { createPaymentValidator } from '#validators/payment' // <--- Importe o validador

export default class PaymentsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPaymentValidator)

    const payment = await Payment.create(payload)

    return response.status(201).json(payment)
  }
}
