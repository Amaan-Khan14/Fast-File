import { Hono } from "hono";
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import {
    getSignedUrl,
    S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";

type CustomContext = {
    s3: S3Client;
};

export const uploadRoute = new Hono<{ Bindings: Env, Variables: CustomContext }>();

interface Env {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
}

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


uploadRoute.get('/test-env', (c) => {
    return c.json({
        AWS_ACCESS_KEY_ID: c.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
        AWS_SECRET_ACCESS_KEY: c.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set'
    });
});

uploadRoute.get('/test-s3', async (c) => {
    const S3 = c.get('s3');
    try {
        const data = await S3.send(new ListBucketsCommand({}));
        return c.json({ success: true, buckets: data.Buckets });
    } catch (error) {
        return c.json({ success: false, error: error });
    }
});


uploadRoute.post('/upload', async (c) => {
    const S3 = c.get('s3')

    const body = await c.req.parseBody()
    const file = body['file'] as File
    console.log(body['file'])

    if (!file || !(file instanceof File)) {
        return c.json({ success: false, error: 'No valid file found' }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()
    const params = {
        Bucket: 'fastfile1',
        Key: file.name,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type 
    }

    try {
        const command = new PutObjectCommand(params)
        const data = await S3.send(command)

        // console.log('Successfully uploaded file:', data)

        const urlCommand = new GetObjectCommand({
            Bucket: 'fastfile1',
            Key: file.name
        })

        const url = await getSignedUrl(S3, urlCommand, { expiresIn: 3600 });

        // console.log("Presigned URL with client" , url);


        // return c.json({ success: true, data: data, url: url });
        return c.json({ success: true, url: url });

    } catch (error) {
        console.error('Error uploading file:', error)
        return c.json({ success: false, error: String(error) });
    }
})
