import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { uploadRoute } from '../routes/upload'

export const app = new Hono()

app.use(logger())

app.get('/', (c) => c.text('Hello Hono!'))

app.route('/', uploadRoute)

export default app
