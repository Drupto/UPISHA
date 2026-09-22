/* Retention cleanup for the admin action audit trail (admin_audit_logs).
 *
 * Deletes audit-log entries older than the retention window (default 180
 * days). Dry-run by default — pass --apply to actually delete.
 *
 * Usage:
 *   node scripts/cleanup-audit-logs.js               # dry-run, 180 days
 *   node scripts/cleanup-audit-logs.js --days=90     # dry-run, 90 days
 *   node scripts/cleanup-audit-logs.js --days=90 --apply
 *
 * Reads Firebase Admin service-account credentials from .env (same vars as
 * the Next.js server: FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY).
 */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const daysArg = args.find((a) => a.startsWith('--days='));
const RETENTION_DAYS = daysArg ? Number.parseInt(daysArg.split('=')[1], 10) : 180;

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) {
  console.error('Invalid --days value:', daysArg);
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}

const COLLECTION = 'admin_audit_logs';
const PAGE_LIMIT = 300; // Firestore runQuery max page size

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  console.log(
    `Audit log cleanup: retention=${RETENTION_DAYS} days, cutoff=${cutoff.toISOString()}, mode=${APPLY ? 'APPLY (deleting)' : 'DRY-RUN (pass --apply to delete)'}`
  );

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
  const H = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  const base = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/databases/(default)/documents`;

  let deleted = 0;
  for (;;) {
    const query = {
      structuredQuery: {
        from: [{ collectionId: COLLECTION, allDescendants: false }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'timestamp' },
            op: 'LESS_THAN',
            value: { timestampValue: cutoff.toISOString() },
          },
        },
        orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'ASCENDING' }],
        limit: { value: PAGE_LIMIT },
      },
    };

    const res = await fetch(`${base}:runQuery`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(query),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));

    const docs = (Array.isArray(body) ? body : []).filter((d) => d.document);
    if (docs.length === 0) break;

    for (const entry of docs) {
      const name = entry.document.name;
      const ts = entry.document.fields?.timestamp?.timestampValue || '(unknown time)';
      if (APPLY) {
        const del = await fetch(`https://firestore.googleapis.com/v1/${name}`, { method: 'DELETE', headers: H });
        if (del.ok) {
          deleted++;
          console.log(`  DELETED ${name.split('/').pop()} (timestamp ${ts})`);
        } else {
          console.log(`  DELETE FAILED ${name} -> HTTP ${del.status}: ${JSON.stringify(await del.json())}`);
        }
      } else {
        deleted++;
        console.log(`  WOULD DELETE ${name.split('/').pop()} (timestamp ${ts})`);
      }
    }

    // When not applying, re-querying returns the same docs — stop after one page.
    if (!APPLY) break;
  }

  console.log(`\nDone. ${deleted} audit entr${deleted === 1 ? 'y' : 'ies'} ${APPLY ? 'deleted' : 'would be deleted'}.`);
}

main().catch((e) => {
  console.error('ERROR', e.message);
  process.exit(1);
});