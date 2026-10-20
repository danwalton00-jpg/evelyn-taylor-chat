import * as SecureStore from 'expo-secure-store';
import bcrypt from 'bcryptjs';

const KEY = 'mpfc_owner_auth_v2';
const normalizeEmail = value => String(value || '').trim().toLowerCase();

async function readOwnerAccount() {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeOwnerAccount(account) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(account));
}

export async function getOwnerAccount() {
  return readOwnerAccount();
}

export async function createOwnerAccount({ name, email, password }) {
  const existing = await getOwnerAccount();
  if (existing) return { ok: false, message: 'An owner account already exists on this device.' };

  const safeName = String(name || '').trim();
  const safeEmail = normalizeEmail(email);
  const safePassword = String(password || '');

  if (!safeName || !safeEmail) return { ok: false, message: 'Enter your name and email.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) return { ok: false, message: 'Enter a valid email address.' };
  if (safePassword.length < 12) return { ok: false, message: 'Use a password with at least 12 characters.' };

  const passwordHash = await bcrypt.hash(safePassword, 12);
  const account = {
    name: safeName,
    email: safeEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await writeOwnerAccount(account);
  return { ok: true, user: { name: account.name, email: account.email, role: 'owner' } };
}

export async function signInOwner(email, password) {
  const account = await getOwnerAccount();
  if (!account) return { ok: false, needsSetup: true, message: 'Create your private owner account first.' };

  const normalizedInputEmail = normalizeEmail(email);
  if (normalizedInputEmail !== account.email) return { ok: false, message: 'This app is restricted to its owner account.' };

  const matches = await bcrypt.compare(String(password || ''), account.passwordHash);
  if (!matches) return { ok: false, message: 'The password is incorrect.' };

  return { ok: true, user: { name: account.name, email: account.email, role: 'owner' } };
}

export async function changeOwnerPassword(currentPassword, newPassword) {
  const account = await getOwnerAccount();
  if (!account) return { ok: false, message: 'Set up the owner account again.' };

  const safePassword = String(newPassword || '');
  const safeCurrentPassword = String(currentPassword || '');

  if (safePassword.length < 12) return { ok: false, message: 'Use a password with at least 12 characters.' };
  if (!(await bcrypt.compare(safeCurrentPassword, account.passwordHash))) return { ok: false, message: 'Your current password is incorrect.' };

  const passwordHash = await bcrypt.hash(safePassword, 12);
  await writeOwnerAccount({ ...account, passwordHash });
  return { ok: true };
}
