import router from '@adonisjs/core/services/router'

// Importação dinâmica do controller (melhor para performance)
const PaymentsController = () => import('#controllers/payments_controller')

router.get('/', async () => {
  return { hello: 'world' }
})

// Rota POST para criar pagamento
router.post('/payments', [PaymentsController, 'store'])