import RabbitMQService from '#services/rabbitmq_service'
import Order from '#models/order'

/*
|--------------------------------------------------------------------------
| Listeners do RabbitMQ
|--------------------------------------------------------------------------
|
| Aqui definimos todas as filas que o Order Service vai escutar.
|
*/

async function listen() {
  
  // 1. Ouvir fila de Pagamento Aprovado
  await RabbitMQService.consume('payment_approved', async (message) => {
    // message deve vir assim: { orderId: 2, status: 'APPROVED' }
    
    console.log('🔄 Atualizando pedido para PAID...')
    
    // Busca o pedido no banco
    const order = await Order.find(message.orderId)
    
    if (order) {
      order.status = 'PAID' // Ou 'APPROVED'
      await order.save()
      console.log(`✅ Pedido #${order.id} atualizado para PAID!`)
    } else {
      console.error(`Pedido #${message.orderId} não encontrado!`)
    }
  })

  // 2. Ouvir fila de Pagamento Recusado (SAGA - Compensação)
  await RabbitMQService.consume('payment_declined', async (message) => {
    console.log('⚠️ Pagamento recusado! Cancelando pedido...')
    
    const order = await Order.find(message.orderId)
    if (order) {
      order.status = 'CANCELLED'
      await order.save()
      console.log(`❌ Pedido #${order.id} cancelado.`)
    }
  })
}

listen()