import { DeleteObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import JSZip from "jszip";


type CustomContext = {
    s3: S3Client;
    payload: JWTPayload;
};

interface Env {
    JWT_SECRET: string;
    DATABASE_URL: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
}

export const uploadRoute = new Hono<{ Bindings: Env, Variables: CustomContext }>();


//variables is required for the context to work properly in the route handler functions (like c.get('s3'))
export const userUploadRouter = new Hono<{
    Bindings: Env, Variables: CustomContext
}>();

userUploadRouter.use(async (c, next) => {
    const S3 = new S3Client({
        region: "ap-south-1",
        credentials: {
            accessKeyId: c.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY
        }
    })
    c.set('s3', S3);


    const token = getCookie(c, 'token')
    if (!token) return c.json({ message: 'Not Authenticated' }, 401)
    try {
        const payload = await verify(token, c.env.JWT_SECRET)
        c.set("payload", payload)

        await next();

    } catch (error) {
        return c.json({ message: 'Invalid Token' }, 401)
    }
})

userUploadRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const S3 = c.get('s3')
    const payload = c.get('payload')
    const userId = await payload.id as number

    const formData = await c.req.formData()
    const file = formData.get('file') as File

    if (!file) {
        return c.json({ success: false, error: 'No valid file found' }, 400)
    }

    console.log('File received:', file.name)

    const uniqueFileId = uuid()
    const fileName = `${uniqueFileId}-${file.name}`.slice(37,)
    const contentType = file.type
    const fileSize = file.size

    const arrayBuffer = await file.arrayBuffer()

    const params = {
        Bucket: 'fastfileforusers',
        Key: fileName,
        Body: new Uint8Array(arrayBuffer),
        ContentType: contentType,
    }

    try {
        const command = new PutObjectCommand(params)
        const data = await S3.send(command)

        if (!data) {
            throw new Error("Error Uploading File to S3")
        }

        await prisma.file.create({
            data: {
                fileName: fileName,
                s3Key: fileName,
                contentType: contentType,
                size: fileSize,
                userId: userId
            }
        })

        const getObjectParams = {
            Bucket: 'fastfileforusers',
            Key: fileName,
            ResponseContentDisposition: `attachment; filename="${fileName}"`,
        }

        const objectCommand = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(S3, objectCommand)

        return c.json({
            success: true,
            url: url,
            size: fileSize,
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return c.json({ success: false, error: String(error) })
    }
})

userUploadRouter.get('/download/:fileId', async (c) => {
    const S3 = c.get('s3')

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const fileId = await c.req.param("fileId")

    const file = await prisma.file.findFirst({
        where: {
            id: fileId
        }
    })

    try {
        const urlCommand = new GetObjectCommand({
            Bucket: 'fastfileforusers',
            Key: fileId,
            ResponseContentDisposition: `attachment;filename="${fileId}"`
        })
        const result = await S3.send(urlCommand)
        const url = await getSignedUrl(S3, urlCommand);
        return c.json({ success: true, size: result.ContentLength, url: url });
    } catch (error) {
        console.error('Error downloading file:', error)
        return c.json({ success: false, error: String(error) });
    }
})


userUploadRouter.get('/files', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const S3 = c.get('s3');
    const payload = c.get("payload");
    const userId = await payload.id as number;

    try {
        const files = await prisma.file.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                fileName: true,
                contentType: true,
                size: true,
                uploadedAt: true,
            },
        });

        const filesWithUrls = await Promise.all(files.map(async (file) => {
            const command = new GetObjectCommand({
                Bucket: "fastfileforusers",
                Key: file.fileName,
            });

            const signedUrl = await getSignedUrl(S3, command);

            return {
                ...file,
                url: signedUrl,
            };
        }));

        return c.json({ success: true, files: filesWithUrls });

    } catch (error) {
        console.error('Error fetching files:', error);
        return c.json({ success: false, error: String(error) });
    }
});

userUploadRouter.delete('/file/:fileId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const S3 = c.get("s3")
    const fileId = c.req.param("fileId")

    try {
        const file = await prisma.file.findUnique({
            where: {
                s3Key: fileId
            }
        });

        if (!file) {
            return c.json({ success: false, message: "File not found in database" }, 404);
        }

        const command = new DeleteObjectCommand({
            Bucket: 'fastfileforusers',
            Key: fileId,
        });

        await S3.send(command);

        await prisma.file.delete({
            where: {
                id: file.id,
                s3Key: fileId
            }
        });

        return c.json({ success: true, message: "File Deleted Successfully" });

    } catch (error) {
        console.error('Error deleting file:', error);
        return c.json({ success: false, error: String(error) }, 500);
    }
});