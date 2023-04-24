const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_PURGE_ZONEID,
    CLOUDFLARE_API_KEY,
    CLOUDFLARE_EMAIL,
} = process.env

if (
    !CLOUDFLARE_ACCOUNT_ID ||
    !CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
    !CLOUDFLARE_R2_BUCKET_NAME
) {
    throw new Error('Missing environment variables.')
}

const cloudflareAccountId: string = CLOUDFLARE_ACCOUNT_ID
const cloudflareR2AccessKeyId: string = CLOUDFLARE_R2_ACCESS_KEY_ID
const cloudflareR2SecretAccessKey: string = CLOUDFLARE_R2_SECRET_ACCESS_KEY
const cloudflareR2BucketName: string = CLOUDFLARE_R2_BUCKET_NAME

const cloudflarePurgeZoneId: string = CLOUDFLARE_PURGE_ZONEID;
const cloudflareApiKey: string = CLOUDFLARE_API_KEY;
const cloudflareEmail: string = CLOUDFLARE_EMAIL;

export {
    cloudflareAccountId,
    cloudflareR2AccessKeyId,
    cloudflareR2SecretAccessKey,
    cloudflareR2BucketName,
    cloudflarePurgeZoneId,
    cloudflareApiKey,
    cloudflareEmail
}
