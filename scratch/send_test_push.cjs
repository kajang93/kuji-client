const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

const targetToken = process.argv[2];
if (!targetToken) {
  console.error("Error: Target FCM token is required.");
  console.error("Usage: node scratch/send_test_push.cjs <FCM_TOKEN>");
  process.exit(1);
}

// 1. Load service account credentials from backend
const serviceAccountPath = '/Users/mac/IdeaProjects/kuji-server/src/main/resources/firebase-service-account.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: firebase-service-account.json not found at " + serviceAccountPath);
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Base64Url encode helper
function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// 2. Generate signed JWT (RS256) for Google OAuth2
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 3600; // Token expires in 1 hour

const header = JSON.stringify({ alg: "RS256", typ: "JWT" });
const claimSet = JSON.stringify({
  iss: sa.client_email,
  scope: "https://www.googleapis.com/auth/firebase.messaging",
  aud: "https://oauth2.googleapis.com/token",
  exp: exp,
  iat: iat
});

const unsignedToken = base64url(header) + "." + base64url(claimSet);

// Sign with private key
const signer = crypto.createSign('RSA-SHA256');
signer.update(unsignedToken);
const signature = signer.sign(sa.private_key, 'base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const jwt = unsignedToken + "." + signature;

// Helper to make HTTPS POST requests
function postRequest(url, headers, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseBody));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

// 3. Request Google OAuth2 Token & Send FCM Message
console.log("Requesting Google OAuth2 token...");
const tokenUrl = "https://oauth2.googleapis.com/token";
const tokenHeaders = { "Content-Type": "application/x-www-form-urlencoded" };
const tokenBody = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

postRequest(tokenUrl, tokenHeaders, tokenBody)
  .then(tokenData => {
    console.log("OAuth2 access token successfully retrieved.");
    
    const accessToken = tokenData.access_token;
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
    const fcmHeaders = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };

    const fcmMessage = JSON.stringify({
      message: {
        token: targetToken,
        notification: {
          title: "실시간 푸시 알림 🔔",
          body: "이치방쿠지 연동 테스트 알림 수신에 성공했습니다!"
        },
        data: {
          title: "실시간 푸시 알림 🔔",
          body: "이치방쿠지 연동 테스트 알림 수신에 성공했습니다!",
          type: "SYSTEM"
        }
      }
    });

    console.log("Sending push notification to target device...");
    return postRequest(fcmUrl, fcmHeaders, fcmMessage);
  })
  .then(fcmResponse => {
    console.log("Push notification sent successfully!");
    console.log("FCM Response:", JSON.stringify(fcmResponse, null, 2));
  })
  .catch(err => {
    console.error("FCM sending failed:");
    console.error(err.message);
  });
