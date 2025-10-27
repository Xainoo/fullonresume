import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// We'll use a very small JSON-backed store for local/dev auth to avoid native
// modules (better-sqlite3). This keeps the dev experience simple. For
// production, migrate to a managed DB.

const DB_DIR = path.resolve(process.cwd(), 'netlify', 'db');
const DB_PATH = path.join(DB_DIR, 'auth.json');

try {
  fs.mkdirSync(DB_DIR, { recursive: true });
} catch (e) {
  // ignore
}

// Ensure DB file exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], lastId: 0 }, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
// New env var name for admin creation code
const ADMIN_CREATION_CODE = process.env.ADMIN_CREATION_CODE || process.env.ADMIN_SECRET || 'admin_secret_change_me';

function makeToken(user) {
  // include name in token when available
  return jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name || null }, JWT_SECRET, { expiresIn: '7d' });
}

function loadDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], lastId: 0 };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function findUserByEmail(db, email) {
  if (!email) return null;
  const needle = String(email).toLowerCase();
  return db.users.find(u => String(u.email || '').toLowerCase() === needle) || null;
}

function insertUser(db, { email, password, role, created_at, name }) {
  const nextId = (db.lastId || 0) + 1;
  const normalized = String(email).trim().toLowerCase();
  const normalizedName = name ? String(name).trim() : '';
  const user = { id: nextId, email: normalized, password, role, created_at, name: normalizedName };
  db.users.push(user);
  db.lastId = nextId;
  saveDB(db);
  return user;
}

export async function handler(event) {
  const { httpMethod, queryStringParameters } = event;
  const op = (queryStringParameters && queryStringParameters.op) || '';

  try {
    if (httpMethod === 'POST' && op === 'register') {
  const { email, password, secretCode, name } = JSON.parse(event.body || '{}');
      if (!email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'email and password required' }) };
      }

      // Validate email and password strength
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // min 8 chars, lower, upper, number
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!emailRe.test(normalizedEmail)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'invalid email format' }) };
      }
      if (!pwdRe.test(String(password))) {
        return { statusCode: 400, body: JSON.stringify({ error: 'password must be at least 8 characters and include lower, upper and number' }) };
      }

  const role = secretCode && secretCode === ADMIN_CREATION_CODE ? 'admin' : 'user';
      const hashed = bcrypt.hashSync(password, 10);
      const createdAt = Date.now();

      const dbObj = loadDB();
      if (findUserByEmail(dbObj, normalizedEmail)) {
        return { statusCode: 409, body: JSON.stringify({ error: 'User already exists' }) };
      }

  const user = insertUser(dbObj, { email: normalizedEmail, password: hashed, role, created_at: createdAt, name: name ? String(name).trim() : '' });
      const token = makeToken(user);
      return { statusCode: 200, body: JSON.stringify({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } }) };
    }

    if (httpMethod === 'POST' && op === 'login') {
      const { email, password } = JSON.parse(event.body || '{}');
      if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: 'email and password required' }) };

      const normalizedEmail = String(email).trim().toLowerCase();
      const dbObj = loadDB();
      const row = findUserByEmail(dbObj, normalizedEmail);
      if (!row) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
      const ok = bcrypt.compareSync(password, row.password);
      if (!ok) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  const user = { id: row.id, email: row.email, role: row.role, name: row.name || '' };
      const token = makeToken(user);
      return { statusCode: 200, body: JSON.stringify({ token, user }) };
    }

    if (httpMethod === 'POST' && op === 'guest') {
      // Create a transient guest user record and return token without saving to DB
      const createdAt = Date.now();
      const guestEmail = `guest_${createdAt}@local`;
      const user = { id: 0, email: guestEmail, role: 'guest' };
      const token = makeToken(user);
      return { statusCode: 200, body: JSON.stringify({ token, user }) };
    }

    if (httpMethod === 'GET' && op === 'me') {
      const auth = event.headers && (event.headers.authorization || event.headers.Authorization);
      if (!auth) return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization' }) };
      const m = auth.match(/^Bearer (.+)$/);
      if (!m) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Authorization' }) };
      try {
        const payload = jwt.verify(m[1], JWT_SECRET);
        return { statusCode: 200, body: JSON.stringify({ user: payload }) };
      } catch (err) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    // admin-only: list users (no passwords)
    if (httpMethod === 'GET' && op === 'list') {
      const auth = event.headers && (event.headers.authorization || event.headers.Authorization);
      if (!auth) return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization' }) };
      const m = auth.match(/^Bearer (.+)$/);
      if (!m) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Authorization' }) };
      try {
        const payload = jwt.verify(m[1], JWT_SECRET);
        if (!payload || payload.role !== 'admin') return { statusCode: 403, body: JSON.stringify({ error: 'admin required' }) };
        const dbObj = loadDB();
        const users = (dbObj.users || []).map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name, created_at: u.created_at }));
        return { statusCode: 200, body: JSON.stringify({ users }) };
      } catch (err) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    // admin-only: delete a user by id
    if (httpMethod === 'POST' && op === 'delete') {
      const auth = event.headers && (event.headers.authorization || event.headers.Authorization);
      if (!auth) return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization' }) };
      const m = auth.match(/^Bearer (.+)$/);
      if (!m) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Authorization' }) };
      try {
        const payload = jwt.verify(m[1], JWT_SECRET);
        if (!payload || payload.role !== 'admin') return { statusCode: 403, body: JSON.stringify({ error: 'admin required' }) };
        const { id } = JSON.parse(event.body || '{}');
        const dbObj = loadDB();
        const idx = dbObj.users.findIndex(u => u.id === Number(id));
        if (idx === -1) return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
        const target = dbObj.users[idx];
        // If target is an admin, only allow deleting your own admin account; do not allow deleting other admins.
        if (target.role === 'admin') {
          if (payload.id !== target.id) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Cannot delete other admin' }) };
          }
          // If deleting self, still prevent removing the last admin
          const otherAdmins = dbObj.users.filter(u => u.role === 'admin' && u.id !== target.id);
          if (otherAdmins.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Cannot delete the last admin' }) };
          }
        }
        dbObj.users.splice(idx, 1);
        saveDB(dbObj);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      } catch (err) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'unknown op' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
