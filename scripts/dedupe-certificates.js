/* One-time cleanup: dedupe Firestore docs that share the same key field.
 *
 * Usage: node scripts/dedupe-duplicates.js <collection> <field> [--apply]
 *   Dry-run by default; pass --apply to actually delete duplicates.
 *   Keeps the earliest-created doc (Firestore createTime) in each group. */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const [collection = 'receipts', field = 'receiptNumber'] = process.argv.slice(2);
const apply = process.argv.includes('--apply');

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

  const res = await fetch(`${base}/${collection}?pageSize=100`, { headers: H });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body));
  const docs = body.documents || [];
  console.log(`Total ${collection} docs: ${docs.length} (mode: ${apply ? 'APPLY' : 'DRY-RUN'})`);

  // Group by the key field
  const groups = new Map();
  for (const d of docs) {
    const key = d.fields?.[field]?.stringValue || '(none)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }

  let deleted = 0;
  for (const [key, list] of groups) {
    if (list.length <= 1) continue;
    console.log(`\nDuplicate ${field}: ${key} (${list.length} docs)`);
    // Keep earliest by createTime
    list.sort((a, b) => a.createTime.localeCompare(b.createTime));
    const keep = list[0];
    console.log(`  KEEP   ${keep.name.split('/').pop()} (created ${keep.createTime})`);
    for (const dup of list.slice(1)) {
      const id = dup.name.split('/').pop();
      if (!apply) {
        console.log(`  WOULD DELETE ${id} (created ${dup.createTime})`);
        continue;
      }
      const del = await fetch(`https://firestore.googleapis.com/v1/${dup.name}`, { method: 'DELETE', headers: H });
      console.log(`  DELETE ${id} (created ${dup.createTime}) -> HTTP ${del.status}`);
      if (del.ok) deleted++;
      else console.log('  DELETE FAILED:', JSON.stringify(await del.json()));
    }
  }
  console.log(`\n${apply ? `Deleted ${deleted} duplicate doc(s).` : 'Dry-run only - pass --apply to delete.'}`);
}
main().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
