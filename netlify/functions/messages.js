import fs from 'fs';
import path from 'path';
import os from 'os';

function resolveDbPath(filename, defaultBody = { records: [] }) {
  const bundledDir = path.resolve(process.cwd(), 'netlify', 'db');
  const bundledPath = path.join(bundledDir, filename);
  try {
    fs.mkdirSync(bundledDir, { recursive: true });
    fs.accessSync(bundledDir, fs.constants.W_OK);
    return bundledPath;
  } catch (e) {
    // fall back to tmp
  }
  const tmpDir = path.join(os.tmpdir(), 'fullonresume', 'db');
  try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (e) {}
  const target = path.join(tmpDir, filename);
  try {
    if (!fs.existsSync(target) && fs.existsSync(bundledPath)) {
      fs.copyFileSync(bundledPath, target);
    }
  } catch (e) {}
  if (!fs.existsSync(target)) {
    try { fs.writeFileSync(target, JSON.stringify(defaultBody, null, 2)); } catch (e) {}
  }
  return target;
}

const DB_PATH = resolveDbPath('messages.json', { records: [] });

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch (e) { return { records: [] }; }
}
function saveDB(db) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); } catch (e) { console.error('saveDB failed', e && e.message); }
}

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
