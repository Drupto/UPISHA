/* Temporary script: verify Firestore index admin access via service account */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

// Parse .env
const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}

async function main() {
  const credentials = {
    client_email: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups`;

  const res = await fetch(`${base}/-/indexes`, {
    headers: { Authorization: `Bearer ${token.token}` },
  });
  console.log('STATUS', res.status);
  const body = await res.json();
  if (!res.ok) { console.log(JSON.stringify(body, null, 2)); process.exit(1); }
  const idx = body.indexes || [];
  console.log('Existing composite indexes:', idx.length);
  for (const i of idx) {
    console.log('-', i.queryScope, i.collectionGroup || '(?)', JSON.stringify(i.fields));
  }
}
main().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
