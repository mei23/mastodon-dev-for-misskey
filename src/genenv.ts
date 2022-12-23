import { randomBytes } from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as webpush from 'web-push';

let t = `
LOCAL_DOMAIN=mastodon.example.com
SINGLE_USER_MODE=false
SECRET_KEY_BASE=%SECRET_KEY_BASE%
OTP_SECRET=%OTP_SECRET%
VAPID_PRIVATE_KEY=%VAPID_PRIVATE_KEY%
VAPID_PUBLIC_KEY=%VAPID_PUBLIC_KEY%
DB_HOST=db
DB_PORT=5432
DB_NAME=mastodon
DB_USER=mastodon
DB_PASS=mastodon
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
SMTP_SERVER=127.0.0.1
SMTP_PORT=25
SMTP_AUTH_METHOD=none
SMTP_OPENSSL_VERIFY_MODE=none
SMTP_ENABLE_STARTTLS=auto
SMTP_FROM_ADDRESS='notifications@mastodon.example.com'
ALLOWED_PRIVATE_ADDRESSES=10.0.0.0/8,127.0.0.0/8,192.168.0.0/16
`;

const vapidKeys = webpush.generateVAPIDKeys();
t = t.replace('%VAPID_PRIVATE_KEY%', vapidKeys.privateKey);
t = t.replace('%VAPID_PUBLIC_KEY%', vapidKeys.publicKey);

t = t.replace('%SECRET_KEY_BASE%', randomBytes(64).toString('hex'));
t = t.replace('%OTP_SECRET%', randomBytes(64).toString('hex'));

const out = resolve(__dirname, '../.env.production');
if (existsSync(out)) throw `Error: ${out} は既に存在する`;

console.log(t);
writeFileSync(out, t);
