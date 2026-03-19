const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET_NAME;

const uploadToS3 = async (fileBuffer, key, contentType) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
    });
    await s3Client.send(command);
    return `${process.env.S3_ENDPOINT_URL}/${BUCKET}/${key}`;
};

const deleteFromS3 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });
    await s3Client.send(command);
};

module.exports = { s3Client, uploadToS3, deleteFromS3, BUCKET };
