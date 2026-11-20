import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "shelfsync-covers";
const publicUrl = process.env.R2_PUBLIC_URL || "";

let r2Client: S3Client | null = null;

if (accountId && accessKeyId && secretAccessKey) {
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadCoverImageToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!r2Client) {
    throw new Error(
      "Cloudflare R2 credentials are not configured in environment variables."
    );
  }

  const key = `covers/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
}
