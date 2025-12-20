import amqplib, { Connection, Channel } from 'amqplib'

class RabbitMQService {
  private connection: Connection | null = null
  private channel: Channel | null = null
  private isInitializing = false

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
  }

  // Tentativa de inicialização com retry/backoff
  async init(retries = 5, backoffMs = 2000) {
    if (this.connection && this.channel) return
    if (this.isInitializing) return

    this.isInitializing = true
    const rabbitHost = process.env.RABBITMQ_HOST || 'localhost'
    let attempt = 0
    while (attempt < retries) {
      try {
        this.connection = await amqplib.connect(`amqp://${rabbitHost}`)
        this.channel = await this.connection.createChannel()

        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err)
        })

        this.connection.on('close', async () => {
          console.warn('RabbitMQ connection closed, will try to reconnect...')
          this.connection = null
          this.channel = null
          // tentar reconectar em background
          try {
            await this.init(retries, backoffMs)
          } catch (e) {
            console.error('Reconnection attempts failed:', e)
          }
        })

        console.log('🐰 RabbitMQ Connected!')
        this.isInitializing = false
        return
      } catch (err: any) {
        attempt += 1
        const wait = backoffMs * attempt
        console.warn(`RabbitMQ connect failed (attempt ${attempt}/${retries}):`, err?.message || err)
        if (attempt >= retries) {
          this.isInitializing = false
          throw err
        }
        await this.sleep(wait)
      }
    }
    this.isInitializing = false
  }

  async ensureChannel() {
    if (!this.channel) {
      await this.init()
    }
    if (!this.channel) throw new Error('RabbitMQ channel not available')
    return this.channel
  }

  async publish(queue: string, message: any) {
    await this.ensureChannel()
    await this.channel!.assertQueue(queue, { durable: true })
    this.channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
    console.log(`📤 Message sent to ${queue}:`, message)
  }

  async consume(queue: string, callback: (message: any) => void) {
    await this.ensureChannel()
    await this.channel!.assertQueue(queue, { durable: true })
    this.channel!.consume(queue, (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString())
          // callback pode ser async
          Promise.resolve(callback(content)).catch((err) => console.error('Consumer callback error:', err))
          this.channel!.ack(msg)
        } catch (err) {
          console.error('Failed to process message:', err)
          // opcional: nack/requeue dependendo da política
          this.channel!.nack(msg, false, false)
        }
      }
    })
    console.log(`📥 Waiting for messages in ${queue}...`)
  }
}

export default new RabbitMQService()
