import fs from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = path.join(os.homedir(), '.tabqueue');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadQueue() {
  ensureDataDir();
  if (!fs.existsSync(QUEUE_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(QUEUE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQueue(entries) {
  ensureDataDir();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export function addEntry(url, tags = []) {
  const queue = loadQueue();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    url,
    tags,
    addedAt: new Date().toISOString(),
  };
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

export function removeEntry(id) {
  const queue = loadQueue();
  const updated = queue.filter((e) => e.id !== id);
  if (updated.length === queue.length) return false;
  saveQueue(updated);
  return true;
}

export function filterByTag(tag) {
  const queue = loadQueue();
  return queue.filter((e) => e.tags.includes(tag));
}
