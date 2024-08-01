import { Hono } from "hono";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

type CustomContext = {
    s3: S3Client;
};

export const uploadRoute = new Hono<{ Bindings: Env, Variables: CustomContext }>();

interface Env {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
}

uploadRoute.use(async (c, next) => {


    console.log('AWS_ACCESS_KEY_ID:', c.env.AWS_ACCESS_KEY_ID);
    console.log('AWS_SECRET_ACCESS_KEY:', c.env.AWS_SECRET_ACCESS_KEY);

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
    const S3 = new S3Client({
        region: "ap-south-1",
        credentials: {
            accessKeyId: c.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY
        }
    });

    try {
        const data = await S3.send(new ListBucketsCommand({}));
        return c.json({ success: true, buckets: data.Buckets });
    } catch (error) {
        return c.json({ success: false, error: error });
    }
});