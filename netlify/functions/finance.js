import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const DB_DIR = path.resolve(process.cwd(), 'netlify', 'db');
const DB_PATH = path.join(DB_DIR, 'finance.json');

try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) { }
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ records: [] }, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch (e) { return { records: [] }; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

export async function handler(event) {
  const { httpMethod, queryStringParameters } = event;
  const op = (queryStringParameters && queryStringParameters.op) || '';

  // verify token and extract user id
  const auth = event.headers && (event.headers.authorization || event.headers.Authorization);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization' }) };
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Authorization' }) };
  let payload;
  try {
    payload = jwt.verify(m[1], JWT_SECRET);
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }
  const uid = payload && payload.id != null ? payload.id : null;
  if (!uid && uid !== 0) return { statusCode: 403, body: JSON.stringify({ error: 'User id missing in token' }) };

  try {
    const db = loadDB();

    if (httpMethod === 'GET' && op === 'list') {
      const userRecords = (db.records || []).filter(r => r.userId === uid);
      return { statusCode: 200, body: JSON.stringify({ records: userRecords }) };
    }

    if (httpMethod === 'POST' && op === 'add') {
      const body = JSON.parse(event.body || '{}');
      const item = {
        id: `tx_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        userId: uid,
        description: body.description || 'No description',
        amount: Number(body.amount) || 0,
        date: body.date || new Date().toISOString(),
        category: body.category || 'General',
      };
      db.records = db.records || [];
      db.records.unshift(item);
      saveDB(db);
      return { statusCode: 200, body: JSON.stringify({ record: item }) };
    }

    if (httpMethod === 'POST' && op === 'delete') {
      const { id } = JSON.parse(event.body || '{}');
      const idx = (db.records || []).findIndex(r => r.id === id && r.userId === uid);
      if (idx === -1) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
      db.records.splice(idx, 1);
      saveDB(db);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (httpMethod === 'POST' && op === 'edit') {
      const body = JSON.parse(event.body || '{}');
      const id = body.id;
      const idx = (db.records || []).findIndex(r => r.id === id && r.userId === uid);
      if (idx === -1) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
      const rec = db.records[idx];
      rec.description = body.description ?? rec.description;
      rec.amount = typeof body.amount === 'number' ? body.amount : rec.amount;
      rec.date = body.date ?? rec.date;
      rec.category = body.category ?? rec.category;
      saveDB(db);
      return { statusCode: 200, body: JSON.stringify({ record: rec }) };
    }

    if (httpMethod === 'POST' && op === 'import') {
      // Accept CSV text in body as 'csv' field
      const { csv } = JSON.parse(event.body || '{}');
      if (!csv) return { statusCode: 400, body: JSON.stringify({ error: 'Missing csv payload' }) };
      const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) return { statusCode: 400, body: JSON.stringify({ error: 'CSV has no data' }) };
      const head = lines[0].split(',').map(s => s.trim().toLowerCase());
      const idxDate = head.indexOf('date');
      const idxDesc = head.indexOf('description');
      const idxAmount = head.indexOf('amount');
      const idxCat = head.indexOf('category');
      const out = [];
      for (let i=1;i<lines.length;i++){
        const cols = lines[i].split(',');
        const date = cols[idxDate] || new Date().toISOString();
        const description = cols[idxDesc] || 'Imported';
        const amount = Number(cols[idxAmount] || 0);
        const category = idxCat >= 0 ? cols[idxCat] : 'Imported';
        const item = { id: `imp_${Date.now()}_${i}`, userId: uid, description, amount, date: new Date(date).toISOString(), category };
        out.push(item);
        db.records.unshift(item);
      }
      saveDB(db);
      return { statusCode: 200, body: JSON.stringify({ records: out }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'unknown op' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
