import router from '@adonisjs/core/services/router'
const OrdersController = () => import('#controllers/orders_controller')

// Rota POST para criar pedidos
router.post('/orders', [OrdersController, 'store'])