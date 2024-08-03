import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { uploadRoute } from '../routes/upload'
import { userRouter } from '../routes/user'
import { userUploadRouter } from '../routes/userUpload'

const app = new Hono<{
    Bindings: {
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
        JWT_SECRET: string;
    }
}>()

app.use(logger())

app.get('/', (c) => c.text('Hello Hono!'))

app.route('/', uploadRoute)
app.route('/user', userRouter)
app.route('/userupload', userUploadRouter)

export default app
