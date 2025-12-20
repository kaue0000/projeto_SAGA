import vine from '@vinejs/vine'

export const createPaymentValidator = vine.compile(
  vine.object({
    userId: vine.number(),

    // Regra: valor positivo e decimal (ex: 10.50)
    amount: vine.number().positive().decimal([0, 2]),

    // Regra: apenas estes métodos são aceitos
    method: vine.string().in(['pix', 'credit_card', 'boleto']),

    // O status é opcional na entrada (se não enviar, o banco põe 'pending'),
    // mas se enviar, validamos que seja string.
    status: vine.string().optional(),

    transactionId: vine.string().optional(),
  })
)
