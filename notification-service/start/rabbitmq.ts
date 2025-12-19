import RabbitMQService from '../app/services/rabbit_mq_service.js'

// Inicia os consumidores assim que o app bootar
RabbitMQService.startConsumers()
  .then(() => console.log('Consumers Inicializados'))
  .catch((err: any) => console.log('Falha ao iniciar Consumers', err))
