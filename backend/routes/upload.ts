import { Hono } from "hono";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, ServerSideEncryption, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import JSZip from "jszip";

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

    const formData = await c.req.formData()
    const files = await formData.getAll('file') as File[]
    console.log('Files received:', files.map(f => f.name))

    if (!files || files.length === 0) {
        return c.json({ success: false, error: 'No valid files found' }, 400)
    }

    const uniqueFileId = uuid();
    let params, fileName, contentType, fileSize

    if (files.length > 1) {
        fileName = `${uniqueFileId}.zip`
        const zip = new JSZip()
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer()
            zip.file(file.name, arrayBuffer)

        }
        const zipContent = await zip.generateAsync({ type: 'uint8array' })

        fileSize = zipContent.byteLength
        contentType = 'application/zip'

        params = {
            Bucket: 'fastfile1',
            Key: fileName,
            Body: zipContent,
            ContentType: contentType,
            ServerSideEncryption: ServerSideEncryption.AES256,
        }
    } else {
        const file = files[0]
        const arrayBuffer = await file.arrayBuffer()
        fileName = `${uniqueFileId}-${file.name}`
        contentType = file.type
        fileSize = arrayBuffer.byteLength
        params = {
            Bucket: 'fastfile1',
            Key: fileName,
            Body: new Uint8Array(arrayBuffer),
            ContentType: contentType,
            ServerSideEncryption: ServerSideEncryption.AES256,
        }
    }
    try {
        const command = new PutObjectCommand(params)
        const data = await S3.send(command)


        const urlCommand = new GetObjectCommand({
            Bucket: 'fastfile1',
            Key: fileName,
            ResponseContentDisposition: `attachment; filename="${fileName}"`
        })

        const url = await getSignedUrl(S3, urlCommand, { expiresIn: 24 * 3600 });

        return c.json({ success: true, url: url });

    } catch (error) {
        console.error('Error uploading file:', error)
        return c.json({ success: false, error: String(error) });
    }
})

uploadRoute.get('/download/:fileId', async (c) => {
    const S3 = c.get('s3')

    const fileId = c.req.param("fileId")
    const headCommand = new HeadObjectCommand({
        Bucket: 'fastfile1',
        Key: fileId
    })
    try {
        const headCommand = new HeadObjectCommand({
            Bucket: 'fastfile1',
            Key: fileId
        });
        const headResult = await S3.send(headCommand);

        const urlCommand = new GetObjectCommand({
            Bucket: 'fastfile1',
            Key: fileId,
            ResponseContentDisposition: `attachment; filename="${fileId.split("-")[5]}"`,
            ResponseContentType: headResult.ContentType,
        });

        const url = await getSignedUrl(S3, urlCommand, { expiresIn: 24 * 3600 });
        return c.json({ success: true, url: url });
    } catch (error) {
        console.error('Error downloading file:', error)
        return c.json({ success: false, error: String(error) });
    }
})

uploadRoute.delete('/:fileId', async (c) => {
    const S3 = c.get('s3')

    const fileId = c.req.param("fileId")
    const params = {
        Bucket: 'fastfile1',
        Key: fileId
    }

    try {
        const deleteCommand = new DeleteObjectCommand(params)
        await S3.send(deleteCommand)
        return c.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error)
        return c.json({ success: false, error: String(error) });
    }
})
