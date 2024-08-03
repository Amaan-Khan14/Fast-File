import { Hono } from "hono";
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

type CustomContext = {
    s3: S3Client;
};

interface Env {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
}

export const uploadRoute = new Hono<{ Bindings: Env, Variables: CustomContext }>();


uploadRoute.use(async (c, next) => {
    const S3 = new S3Client({
        region: "ap-south-1",
        credentials: {
            accessKeyId: c.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY
        }
    });

    c.set('s3', S3);
    await next();
});

uploadRoute.post('/upload', async (c) => {
    const S3 = c.get('s3')

    const body = await c.req.parseBody()
    const file = body['file'] as File
    console.log(body['file'])

    if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: 'No valid file found' }, 400)
    }

    const uniqueFileId = `${uuid()}-${file.name}`
    const arrayBuffer = await file.arrayBuffer()
    const params = {
        Bucket: 'fastfile1',
        Key: uniqueFileId,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
    }

    try {
        const command = new PutObjectCommand(params)
        const data = await S3.send(command)


        const urlCommand = new GetObjectCommand({
            Bucket: 'fastfile1',
            Key: uniqueFileId,
            ResponseContentDisposition: `attachment; filename="${file.name}"`
        })

        const url = await getSignedUrl(S3, urlCommand, { expiresIn: 24 * 3600 });

        return c.json({ success: true, data: data, url: url });
        return c.json({ success: true, url: url });

    } catch (error) {
        console.error('Error uploading file:', error)
        return c.json({ success: false, error: String(error) });
    }
})

uploadRoute.get('/download/:fileId', async (c) => {
    const S3 = c.get('s3')

    const fileId = c.req.param("fileId")

    const urlCommand = new GetObjectCommand({
        Bucket: 'fastfile1',
        Key: fileId,
        ResponseContentDisposition: `attachment;filename="${fileId.split("-")[5]}"`
    })
    try {
        const url = await getSignedUrl(S3, urlCommand, { expiresIn: 3600 });
        return c.json({ success: true, url: url });
    } catch (error) {
        console.error('Error downloading file:', error)
        return c.json({ success: false, error: String(error) });

    }
})
