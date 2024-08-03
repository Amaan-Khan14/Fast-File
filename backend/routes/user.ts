import { signInSchema, signUpSchema } from "@amaank14/zod-common";
import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { compare, hash } from "bcryptjs";
import { sign, verify } from 'hono/jwt'
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { withAccelerate } from "@prisma/extension-accelerate";


export const userRouter = new Hono<{
    Bindings: {
        JWT_SECRET: string;
        DATABASE_URL: string;
    }
}>();

userRouter.post('/reg', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json()
    const { success, error } = signUpSchema.safeParse(body)

    if (!body) return c.json({ success: false, message: "Body not found" })
    if (success) {
        try {
            const hashedPassword = await hash(body.password, 10)
            const user = await prisma.user.create({
                data: {
                    username: body.username,
                    password: hashedPassword
                },
                select: {
                    username: true
                }
            })
            return c.json({ message: 'User created', user: user })
        } catch (error) {
            return c.json({ message: "Username or Email already exists" }, 400)
        }
    }

    else return c.json({ message: 'Invalid body', error: error.issues }, 400)
})

userRouter.post('/login', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());


    const body = await c.req.json()
    const { success, error } = signInSchema.safeParse(body)

    if (!success) return c.json({ message: 'Invalid body', error: error.issues }, 400)

    try {
        const user = await prisma.user.findFirst({
            where: {
                username: body.username
            }
        })
        if (!user) {
            return c.json({ message: 'User not found' }, 401)
        }

        const passwordMatch = await compare(body.password, user.password)

        if (!passwordMatch) return c.json({ message: 'Invalid Password' }, 401)

        const token = await sign({
            id: user.id,
            username: user.username
        }, c.env.JWT_SECRET)

        setCookie(c, "token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        return c.json({ message: 'Logged in Successfully' })

    } catch (error) {
        return c.json({ message: "Some Error Occured", error: error }, 400)
    }

})

userRouter.post('/logout', async (c) => {
    deleteCookie(c, 'token', {
        path: '/',
        secure: true,
        sameSite: 'Lax',
        httpOnly: true
    })
    return c.json({ message: "Logged out successfully" })
})

userRouter.get('/me', async (c) => {
    const token = getCookie(c, 'token')
    if (!token) return c.json({ message: 'Not Authenticated' }, 401)

    try {
        const payload = await verify(token, c.env.JWT_SECRET)
        return c.json({ message: 'Authenticated', payload })
    } catch (error) {
        return c.json({ message: 'Invalid Token' }, 401)
    }
})