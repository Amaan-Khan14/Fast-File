import { PrismaClient } from "@prisma/client/extension";
import { Hono } from "hono";

export const userRoute = new Hono();

const prisma = new PrismaClient()

userRoute.post('/reg', async (c) => {
    const body = c.req.json()
    

})
