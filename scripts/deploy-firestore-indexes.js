/* Temporary script: deploy composite indexes from firestore.indexes.json via REST
 * (Firebase CLI lacks serviceusage permission on this service account). */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}

function fingerprint(idx) {
  return [
    idx.queryScope || 'COLLECTION',
    idx.collectionGroup || idx.collectionId,
    (idx.fields || []).map((f) => `${f.fieldPath}:${f.order || f.arrayConfig || ''}`).join('|'),
  ].join('#');
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
  const token = (await client.getAccessToken()).token;
  const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups`;

  const desired = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'firestore.indexes.json'), 'utf8')).indexes;

  // Existing indexes
  const res = await fetch(`${base}/-/indexes`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`List failed: ${res.status} ${JSON.stringify(await res.json())}`);
  const existing = new Set(((await res.json()).indexes || []).map(fingerprint));
  console.log(`Existing composite indexes: ${existing.size}`);

  // Create missing
  const operations = [];
  for (const idx of desired) {
    const fp = fingerprint(idx);
    if (existing.has(fp)) {
      console.log(`SKIP (exists): ${fp}`);
      continue;
    }
    const createRes = await fetch(`${base}/${idx.collectionGroup}/indexes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryScope: idx.queryScope, fields: idx.fields }),
    });
    const body = await createRes.json();
    if (!createRes.ok) {
      console.error(`FAIL ${idx.collectionGroup}: ${JSON.stringify(body)}`);
      process.exitCode = 1;
    } else {
      console.log(`CREATED (building): ${fp}`);
      operations.push(body.name);
    }
  }
  console.log(`\nSubmitted ${operations.length} new index build operations.`);
}

main().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
