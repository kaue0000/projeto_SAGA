import amqp from 'amqplib'
import env from '#start/env'

class RabbitMQService {
  private connection: any = null
  private channel: any = null

  private async connect() {
    if (this.connection) return
    try {
      this.connection = await amqp.connect(env.get('RABBITMQ_URL'))
      this.channel = await this.connection.createChannel()
      console.log('🐰 Conectado ao RabbitMQ!')
    } catch (error) {
      console.error('Erro ao conectar no RabbitMQ:', error)
    }
  }

  public async publish(queue: string, message: any) {
    if (!this.channel) await this.connect()
    const data = JSON.stringify(message)
    await this.channel?.assertQueue(queue, { durable: true })
    this.channel?.sendToQueue(queue, Buffer.from(data))
    console.log(`📤 Enviado para [${queue}]:`, data)
  }

  // --- NOVO MÉTODO: OUVIR MENSAGENS ---
  public async consume(queue: string, callback: (message: any) => Promise<void>) {
    if (!this.channel) await this.connect()

    await this.channel?.assertQueue(queue, { durable: true })

    // O Consume fica "preso" aqui escutando eternamente
    this.channel?.consume(queue, async (msg: any) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString())
          console.log(`KX Recebido de [${queue}]:`, content)
          
          // Executa a função que passamos como parâmetro
          await callback(content)

          // Avisa o RabbitMQ que deu tudo certo (Apaga a mensagem)
          this.channel?.ack(msg)
        } catch (error) {
          console.error(`Erro ao processar mensagem da fila ${queue}:`, error)
          // Se der erro, não damos ACK (a mensagem volta pra fila ou vai pra Dead Letter)
        }
      }
    })
  }
}

export default new RabbitMQService()