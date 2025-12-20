import RabbitMQService from '../services/rabbitmq_service.js'
import Payment from '#models/payment'

// Função para iniciar o consumidor
async function listenToOrders() {
  await RabbitMQService.init()

  // Ouve a fila 'order_created'
  await RabbitMQService.consume('order_created', async (orderData) => {
    console.log('⚡ Pedido recebido:', orderData)

    // Regra de Negócio:
    // < 1000 -> APROVADO
    // >= 1000 -> RECUSADO
    const isApproved = orderData.total < 1000
    const status = isApproved ? 'approved' : 'declined'

    // 1. Salva no Banco de Dados
    // Vamos assumir que a mensagem vem com { id, userId, total }
    const payment = await Payment.create({
      orderId: orderData.id,
      userId: orderData.userId,
      amount: orderData.total,
      method: 'credit_card', // Padrão para este teste
      status: status
    })

    console.log(`💾 Pagamento salvo como: ${status}`)

    // 2. Publica a resposta para o próximo serviço
    if (isApproved) {
      await RabbitMQService.publish('payment_approved', {
        orderId: orderData.id,
        paymentId: payment.id,
        status: 'approved'
      })
    } else {
      await RabbitMQService.publish('payment_declined', {
        orderId: orderData.id,
        reason: 'Valor acima do limite automático',
        status: 'declined'
      })
    }
  })
}

listenToOrders()