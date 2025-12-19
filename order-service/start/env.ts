// start/env.ts
import { Env } from '@adonisjs/core/env'
// APAGUE A LINHA: import { schema } from '@adonisjs/env/validator' <--- TIRE ISSO

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  
  // CORREÇÃO AQUI EMBAIXO: Use Env.schema.string() igual aos outros
  RABBITMQ_URL: Env.schema.string(),
})