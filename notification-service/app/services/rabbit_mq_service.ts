import amqp from 'amqplib'
import env from '#start/env'
import Notification from '#models/notification'

class RabbitMQService {
  private connection: any
  private channel: any

  // Lista das filas (tópicos) que este serviço deve escutar
  private queues = ['order_created', 'payment_approved', 'payment_declined', 'order_cancelled']

  public async startConsumers() {
    const rabbitUrl = env.get('RABBITMQ_URL') as string

    // Estabelece a conexão TCP com o servidor RabbitMQ
    this.connection = await amqp.connect(rabbitUrl)

    // Cria um canal (via leve) dentro da conexão para enviar/receber comandos
    this.channel = await this.connection.createChannel()

    console.log('🐰 Conectado ao RabbitMQ!')

    // Itera sobre a lista de filas e inicia um "ouvinte" para cada uma
    for (const queue of this.queues) {
      await this.consumeQueue(queue)
    }
  }

  private async consumeQueue(queueName: string) {
    // Garante que a fila existe antes de tentar consumir.
    // 'durable: true' garante que a fila sobreviva se o RabbitMQ reiniciar.
    await this.channel.assertQueue(queueName, { durable: true })

    // Define a função de callback que será executada sempre que chegar uma mensagem
    this.channel.consume(queueName, async (msg: any) => {
      if (!msg) return

      // Converte o buffer da mensagem para string
      const content = msg.content.toString()
      console.log(`📩 [${queueName}] Recebido com sucesso:`, content)

      // Regra de Negócio: Salva a mensagem no banco de dados como uma notificação
      await Notification.create({
        eventType: queueName, // Usa o nome da fila como tipo do evento
        message: content,
      })

      // ACK (Acknowledgment) confirma para o RabbitMQ que a mensagem foi processada com sucesso
      // e pode ser removida da fila. Sem isso, a mensagem voltaria para a fila.
      this.channel.ack(msg)
    })
  }
}

// Exporta uma instância única (Singleton) para ser usada em toda a aplicação
export default new RabbitMQService()
