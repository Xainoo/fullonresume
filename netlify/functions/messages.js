import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(process.cwd(), 'netlify', 'db');
const DB_PATH = path.join(DB_DIR, 'messages.json');

try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) { }
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ records: [] }, null, 2));
}

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch (e) { return { records: [] }; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabaseListMessages() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('supabase not configured');
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/messages?select=*&order=ts.asc`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY } });
  if (!res.ok) throw new Error(`supabase list failed: ${res.status}`);
  return await res.json();
}

async function supabaseAddMessage(item) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('supabase not configured');
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`supabase insert failed: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) && json[0] ? json[0] : json;
}

export async function handler(event) {
  const { httpMethod, queryStringParameters } = event;
  const op = (queryStringParameters && queryStringParameters.op) || '';
  try {
    const db = loadDB();

    if (httpMethod === 'GET' && op === 'list') {
      // prefer Supabase if configured
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const rows = await supabaseListMessages();
          return { statusCode: 200, body: JSON.stringify({ records: rows }) };
        } catch (e) {
          // fallback to file DB
        }
      }
      const records = (db.records || []).slice().sort((a,b)=>a.ts-b.ts);
      return { statusCode: 200, body: JSON.stringify({ records }) };
    }

    if (httpMethod === 'POST' && op === 'add') {
      const body = JSON.parse(event.body || '{}');
      const item = {
        id: body.id || `msg_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        user: body.user || 'visitor',
        text: body.text || '',
        ts: body.ts || Date.now(),
      };
      // try Supabase first when configured
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const rec = await supabaseAddMessage(item);
          return { statusCode: 200, body: JSON.stringify({ record: rec }) };
        } catch (e) {
          // fallback to file DB
        }
      }
      db.records = db.records || [];
      db.records.push(item);
      saveDB(db);
      return { statusCode: 200, body: JSON.stringify({ record: item }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'unknown op' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
