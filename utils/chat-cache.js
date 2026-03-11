const DB_NAME = 'task-chat-cache';
const STORE_NAME = 'kv';
const DB_VERSION = 1;
const CACHE_VERSION = 1;

const memoryStore = new Map();

let dbPromise = null;

function nowIso() {
  return new Date().toISOString();
}

function metric(name, payload = {}) {
  if (typeof window === 'undefined') return;
  try {
    // Keep lightweight instrumentation discoverable without noisy UI impact.
    console.debug('[chat-cache]', name, payload);
  } catch {
    // no-op
  }
}

function getEnvSafeIndexedDb() {
  if (typeof window === 'undefined') return null;
  return window.indexedDB || null;
}

function openDb() {
  const indexedDb = getEnvSafeIndexedDb();
  if (!indexedDb) return Promise.resolve(null);

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const request = indexedDb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

  return dbPromise;
}

async function idbGet(key) {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  if (!db) return;

  await new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

async function idbDelete(key) {
  const db = await openDb();
  if (!db) return;

  await new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

async function idbKeysByPrefix(prefix) {
  const db = await openDb();
  if (!db) return [];

  return new Promise((resolve) => {
    const keys = [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(keys);
        return;
      }

      const key = String(cursor.key || '');
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
      cursor.continue();
    };

    req.onerror = () => resolve(keys);
  });
}

function envelope(actorKey, data, lastSyncedAt = nowIso()) {
  return {
    version: CACHE_VERSION,
    actorKey,
    updatedAt: nowIso(),
    lastSyncedAt,
    data,
  };
}

async function getEntry(key) {
  if (memoryStore.has(key)) {
    metric('cacheHit', { layer: 'memory', key });
    return memoryStore.get(key);
  }

  const fromDb = await idbGet(key);
  if (fromDb) {
    memoryStore.set(key, fromDb);
    metric('cacheHit', { layer: 'indexeddb', key });
    return fromDb;
  }

  metric('cacheMiss', { key });
  return null;
}

async function setEntry(key, value) {
  memoryStore.set(key, value);
  await idbSet(key, value);
}

function threadsKey(actorKey) {
  return `threads:${actorKey}`;
}

function usersKey(actorKey) {
  return `users:${actorKey}`;
}

function messagesKey(actorKey, threadId) {
  return `messages:${actorKey}:${threadId}`;
}

function lastActorKeyMeta() {
  return 'meta:lastActorKey';
}

function lastThreadMeta(actorKey) {
  return `meta:lastThread:${actorKey}`;
}

function isEnvelopeValid(entry, actorKey) {
  return !!entry && entry.version === CACHE_VERSION && entry.actorKey === actorKey;
}

function isSoftStale(entry, ttlMs) {
  if (!entry?.updatedAt) return true;
  const ts = new Date(entry.updatedAt).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > ttlMs;
}

export function mergeMessages(existing = [], incoming = []) {
  const map = new Map();

  for (const item of existing) {
    if (item?.id) map.set(item.id, item);
  }

  for (const item of incoming) {
    if (item?.id) map.set(item.id, item);
  }

  return Array.from(map.values()).sort((a, b) => {
    const aTs = new Date(a.created_at || 0).getTime();
    const bTs = new Date(b.created_at || 0).getTime();
    return aTs - bTs;
  });
}

export async function loadWarmSnapshot() {
  const meta = await getEntry(lastActorKeyMeta());
  const actorKey = meta?.actorKey || null;
  if (!actorKey) return null;

  const [threadsEntry, usersEntry, lastThreadEntry] = await Promise.all([
    getEntry(threadsKey(actorKey)),
    getEntry(usersKey(actorKey)),
    getEntry(lastThreadMeta(actorKey)),
  ]);

  if (!isEnvelopeValid(threadsEntry, actorKey) && !isEnvelopeValid(usersEntry, actorKey)) {
    return null;
  }

  const selectedThreadId = lastThreadEntry?.threadId || (threadsEntry?.data?.[0]?.id || '');
  const messagesEntry = selectedThreadId
    ? await getEntry(messagesKey(actorKey, selectedThreadId))
    : null;

  return {
    actorKey,
    threads: isEnvelopeValid(threadsEntry, actorKey) ? (threadsEntry.data || []) : [],
    users: isEnvelopeValid(usersEntry, actorKey) ? (usersEntry.data || []) : [],
    selectedThreadId,
    messages: isEnvelopeValid(messagesEntry, actorKey) ? (messagesEntry.data || []) : [],
    stale: {
      threads: isSoftStale(threadsEntry, 60_000),
      users: isSoftStale(usersEntry, 60_000),
    },
  };
}

export async function setLastActiveActor(actorKey) {
  if (!actorKey) return;
  await setEntry(lastActorKeyMeta(), { actorKey, updatedAt: nowIso() });
}

export async function setLastSelectedThread(actorKey, threadId) {
  if (!actorKey) return;
  await setEntry(lastThreadMeta(actorKey), { actorKey, threadId: threadId || '', updatedAt: nowIso() });
}

export async function readThreads(actorKey) {
  if (!actorKey) return [];
  const entry = await getEntry(threadsKey(actorKey));
  if (!isEnvelopeValid(entry, actorKey)) return [];
  return entry.data || [];
}

export async function writeThreads(actorKey, threads, source = 'unknown') {
  if (!actorKey) return;
  await setEntry(threadsKey(actorKey), envelope(actorKey, threads));
  await setLastActiveActor(actorKey);
  metric('threadsWrite', { actorKey, source, count: threads?.length || 0 });
}

export async function readUsers(actorKey) {
  if (!actorKey) return [];
  const entry = await getEntry(usersKey(actorKey));
  if (!isEnvelopeValid(entry, actorKey)) return [];
  return entry.data || [];
}

export async function writeUsers(actorKey, users, source = 'unknown') {
  if (!actorKey) return;
  await setEntry(usersKey(actorKey), envelope(actorKey, users));
  await setLastActiveActor(actorKey);
  metric('usersWrite', { actorKey, source, count: users?.length || 0 });
}

export async function readMessages(actorKey, threadId) {
  if (!actorKey || !threadId) return [];
  const entry = await getEntry(messagesKey(actorKey, threadId));
  if (!isEnvelopeValid(entry, actorKey)) return [];
  return entry.data || [];
}

export async function writeMessages(actorKey, threadId, messages, source = 'unknown') {
  if (!actorKey || !threadId) return;
  await setEntry(messagesKey(actorKey, threadId), envelope(actorKey, messages));
  await setLastActiveActor(actorKey);
  await setLastSelectedThread(actorKey, threadId);
  metric('messagesWrite', { actorKey, threadId, source, count: messages?.length || 0 });
}

export async function upsertMessage(actorKey, threadId, message, source = 'unknown') {
  if (!actorKey || !threadId || !message) return;
  const existing = await readMessages(actorKey, threadId);
  const merged = mergeMessages(existing, [message]);
  await writeMessages(actorKey, threadId, merged, source);
}

export async function replaceMessage(actorKey, threadId, tempId, nextMessage) {
  if (!actorKey || !threadId || !tempId || !nextMessage) return;
  const existing = await readMessages(actorKey, threadId);
  const withoutTemp = existing.filter((msg) => msg.id !== tempId);
  const merged = mergeMessages(withoutTemp, [nextMessage]);
  await writeMessages(actorKey, threadId, merged, 'optimistic-replace');
}

export async function removeMessage(actorKey, threadId, messageId) {
  if (!actorKey || !threadId || !messageId) return;
  const existing = await readMessages(actorKey, threadId);
  const next = existing.filter((msg) => msg.id !== messageId);
  await writeMessages(actorKey, threadId, next, 'rollback');
}

export async function compactMessages(actorKey, keepThreadIds = []) {
  if (!actorKey) return;

  const allowed = new Set((keepThreadIds || []).filter(Boolean));
  const prefix = `messages:${actorKey}:`;
  const keys = await idbKeysByPrefix(prefix);

  await Promise.all(
    keys.map(async (key) => {
      const threadId = key.slice(prefix.length);
      if (!allowed.has(threadId)) {
        memoryStore.delete(key);
        await idbDelete(key);
      }
    })
  );

  metric('messagesCompact', { actorKey, kept: allowed.size, deleted: Math.max(0, keys.length - allowed.size) });
}