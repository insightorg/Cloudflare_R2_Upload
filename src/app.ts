import {
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client
} from '@aws-sdk/client-s3'
import fs  from 'fs'
import md5 from 'md5'
import axios from 'axios'
import crypto from "crypto"
import path from 'path'

import {
    cloudflareAccountId,
    cloudflareR2AccessKeyId,
    cloudflareR2SecretAccessKey,
    cloudflareR2BucketName,
    cloudflarePurgeZoneId,
    cloudflareEmail,
    cloudflareApiKey
} from './config.js'

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: cloudflareR2AccessKeyId,
        secretAccessKey: cloudflareR2SecretAccessKey,
    },
});

const getFileList = (dirName) => {
    let files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getFileList(`${dirName}/${item.name}`)];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};

const files: string[] = getFileList('uploads');

const revision = fs.readFileSync("revision.txt").toString().split("\n")[0].trim();

const revisionFolderPath = path.join(process.cwd(), `revisions/${revision}`);
if (!fs.existsSync(revisionFolderPath)) {
    fs.mkdirSync(revisionFolderPath, { recursive: true });
}

let total = 0;

try {
    for (const file of files) {
        const fileStream = fs.createReadStream(file);
        const fileName = file.replace(/uploads\//g, '');

        if (fileName.includes('.gitkeep'))
            continue;

        const hash = crypto.createHash('md5');

        fileStream.on('data', function(chunk) {
            hash.update(chunk);
        });
        
        fileStream.on('end', async function() {
            const digest = hash.digest('hex');
        
            const uploadParams = {
                Bucket: cloudflareR2BucketName,
                Key: fileName,
                Body: fs.createReadStream(file),
                ContentLength: fs.statSync(file).size,
                ContentType: 'application/octet-stream',
            };
        
            const cmd = new PutObjectCommand(uploadParams);
        
            cmd.middlewareStack.add((next) => async (args: any) => {
                args.request.headers['if-none-match'] = `"${digest}"`;
                return await next(args);
            }, {
                step: 'build',
                name: 'addETag'
            })
    
            const data = await S3.send(cmd);

            // Move file to revision folder
            const destFilePath = path.join(revisionFolderPath, fileName);
            fs.mkdirSync(path.dirname(destFilePath), { recursive: true });
            fs.renameSync(file, destFilePath);

            console.log(`Success ${fileName} - Status Code: ${data.$metadata.httpStatusCode}`);

            total++;

            if (total === files.length) {
                // axios.post("https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache".replace('{ZONE_ID}', cloudflarePurgeZoneId), {
                //     files: files.map((f) => `https://patcher.fallendesert.com/${f.replace("uploads/", "")}`)
                // }, {
                //     headers: {
                //         'X-Auth-Email': cloudflareEmail,
                //         'X-Auth-Key': cloudflareApiKey,
                //         'Content-Type': 'application/json'
                //     }
                // }).then(response => {
                //     console.log(response.data);
                // }).catch(error => {
                //     console.error(error);
                // });
            }
        });
    }
} catch (err) {
    if (err.hasOwnProperty('$metadata')) {
        console.error(`Error - Status Code: ${err.$metadata.httpStatusCode} - ${err.message}`);
    } else {
        console.error('Error', err);
    }
}