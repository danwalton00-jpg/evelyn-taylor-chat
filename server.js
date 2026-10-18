import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = Number(process.env.PORT || 8080);
const isProduction = process.env.NODE_ENV === 'production';
const required = ['OWNER_EMAIL', 'OWNER_PASSWORD_HASH', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: false })); // Add only your exact app/web origins if browser clients are used.
app.use(express.json({ limit: '32kb' }));
app.use('/auth/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }));

const metaStates = new Map(); // Development-only; use a shared TTL store in multi-instance production deployments.
const stateTtlMs = 5 * 60 * 1000;

function ownerToken() {
  return jwt.sign({ sub: process.env.OWNER_EMAIL.toLowerCase(), role: 'owner' }, process.env.JWT_SECRET, { expiresIn: '30m', issuer: 'meta-profile-finder' });
}
function requireOwner(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'meta-profile-finder' });
    if (payload.role !== 'owner' || payload.sub !== process.env.OWNER_EMAIL.toLowerCase()) throw new Error('wrong role');
    req.owner = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Sign in required.' });
  }
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'meta-profile-finder-backend' }));

app.post('/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password || email !== process.env.OWNER_EMAIL.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid owner credentials.' });
  }
  const match = await bcrypt.compare(password, process.env.OWNER_PASSWORD_HASH);
  if (!match) return res.status(401).json({ error: 'Invalid owner credentials.' });
  return res.json({ accessToken: ownerToken(), tokenType: 'Bearer', expiresIn: 1800, owner: { name: 'Evelyn Taylor', email, role: 'owner' } });
});

app.get('/auth/me', requireOwner, (req, res) => res.json({ owner: { name: 'Evelyn Taylor', email: req.owner.sub, role: 'owner' } }));

// Password change must be backed by a persistent user store. This endpoint deliberately refuses
// to pretend that changing an environment variable at runtime is a durable password update.
app.post('/auth/change-password', requireOwner, (_req, res) => res.status(501).json({
  error: 'Password changes require a persistent user database. Configure a database-backed owner credential store before enabling this endpoint.'
}));

app.get('/auth/meta/start', requireOwner, (req, res) => {
  const { META_APP_ID, META_REDIRECT_URI } = process.env;
  if (!META_APP_ID || !META_REDIRECT_URI) return res.status(503).json({ error: 'Meta OAuth is not configured. Set META_APP_ID and META_REDIRECT_URI on the backend.' });
  const state = crypto.randomBytes(32).toString('hex');
  metaStates.set(state, { owner: req.owner.sub, createdAt: Date.now() });
  for (const [key, item] of metaStates) if (Date.now() - item.createdAt > stateTtlMs) metaStates.delete(key);
  const version = process.env.META_API_VERSION || 'v26.0';
  const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
  url.searchParams.set('client_id', META_APP_ID);
  url.searchParams.set('redirect_uri', META_REDIRECT_URI);
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'public_profile');
  return res.json({ authorizationUrl: url.toString(), note: 'Only request additional permissions after confirming they are necessary and supported by Meta review.' });
});

app.get('/auth/meta/callback', async (req, res) => {
  const state = String(req.query.state || '');
  const record = metaStates.get(state);
  metaStates.delete(state);
  if (!record || Date.now() - record.createdAt > stateTtlMs) return res.status(400).send('Invalid or expired OAuth state. Return to the app and try again.');
  if (req.query.error) return res.status(400).send('Meta authorization was cancelled or denied. Return to the app.');
  const code = String(req.query.code || '');
  if (!code) return res.status(400).send('Missing authorization code.');
  const { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI, META_API_VERSION } = process.env;
  if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) return res.status(503).send('Meta OAuth is not configured on this server.');
  try {
    const url = new URL(`https://graph.facebook.com/${META_API_VERSION || 'v26.0'}/oauth/access_token`);
    url.searchParams.set('client_id', META_APP_ID);
    url.searchParams.set('client_secret', META_APP_SECRET);
    url.searchParams.set('redirect_uri', META_REDIRECT_URI);
    url.searchParams.set('code', code);
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) return res.status(502).send('Meta token exchange failed. Check backend logs and Meta app settings.');
    // Do not expose the Meta token in a URL or to the mobile client. Production must encrypt and
    // persist it in a secret store/database and associate it with this owner before enabling APIs.
    return res.status(501).send('Meta authorization succeeded, but token storage is not configured. Connect an encrypted token store before using Meta APIs.');
  } catch {
    return res.status(502).send('Unable to contact Meta. Please try again later.');
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.listen(port, () => console.log(`Meta Profile Finder API listening on port ${port}`));
