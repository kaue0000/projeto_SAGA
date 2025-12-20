import amqplib, { Connection, Channel } from 'amqplib'

class RabbitMQService {
  private connection: Connection | null = null
  private channel: Channel | null = null

  async init() {
    // Conecta no RabbitMQ (garanta que seu Docker esteja rodando)
    const rabbitHost = process.env.RABBITMQ_HOST || 'localhost'
    this.connection = await amqplib.connect(`amqp://${rabbitHost}`)
    this.channel = await this.connection.createChannel()
    console.log('🐰 RabbitMQ Connected!')
  }

  async publish(queue: string, message: any) {
    if (!this.channel) await this.init()

    await this.channel?.assertQueue(queue, { durable: true })
    this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
    console.log(`📤 Message sent to ${queue}:`, message)
  }

  async consume(queue: string, callback: (message: any) => void) {
    if (!this.channel) await this.init()

    await this.channel?.assertQueue(queue, { durable: true })
    this.channel?.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString())
        callback(content)
        this.channel?.ack(msg) // Confirma que processou
      }
    })
    console.log(`📥 Waiting for messages in ${queue}...`)
  }
}

export default new RabbitMQService()
