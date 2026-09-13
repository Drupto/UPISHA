/* One-time cleanup: deduplicate receipts that share the same receiptNumber.
 * Keeps the earliest-created document, deletes the rest. READ-then-DELETE only. */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

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
  const accessToken = (await client.getAccessToken()).token;
  const H = { Authorization: `Bearer ${accessToken}` };
  const base = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/databases/(default)/documents`;

  const res = await fetch(`${base}/receipts?pageSize=100`, { headers: H });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body));
  const docs = body.documents || [];
  console.log(`Total receipt docs: ${docs.length}`);

  // Group by receiptNumber
  const groups = new Map();
  for (const d of docs) {
    const num = d.fields?.receiptNumber?.stringValue || '(none)';
    if (!groups.has(num)) groups.set(num, []);
    groups.get(num).push(d);
  }

  let deleted = 0;
  for (const [num, list] of groups) {
    if (list.length <= 1) continue;
    console.log(`\nDuplicate receiptNumber: ${num} (${list.length} docs)`);
    // Keep earliest by createTime
    list.sort((a, b) => a.createTime.localeCompare(b.createTime));
    const keep = list[0];
    console.log(`  KEEP   ${keep.name.split('/').pop()} (created ${keep.createTime})`);
    for (const dup of list.slice(1)) {
      const id = dup.name.split('/').pop();
      const del = await fetch(`https://firestore.googleapis.com/v1/${dup.name}`, { method: 'DELETE', headers: H });
      console.log(`  DELETE ${id} (created ${dup.createTime}) -> HTTP ${del.status}`);
      if (del.ok) deleted++;
      else console.log('  DELETE FAILED:', JSON.stringify(await del.json()));
    }
  }
  console.log(`\nDeleted ${deleted} duplicate receipt(s).`);
}
main().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
