// ============================================================
// Memory Store — Simple in-memory key-value storage
// ============================================================

const memoryStore = new Map();

/**
 * Save a memory entry
 * @param {string} key   - descriptive key (e.g. "manager", "rahul_email")
 * @param {string} value - the information to remember
 */
export function storeMemory(key, value) {
  const normalizedKey = key.toLowerCase().trim();
  memoryStore.set(normalizedKey, {
    key: normalizedKey,
    value,
    created_at: new Date().toISOString(),
  });
  console.log(`💾 Memory saved: "${normalizedKey}" = "${value}"`);
}

/**
 * Recall a memory by key (exact or fuzzy match)
 * @param {string} query - search keyword
 * @returns {object|null}
 */
export function recallMemory(query) {
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match first
  if (memoryStore.has(normalizedQuery)) {
    const mem = memoryStore.get(normalizedQuery);
    console.log(`🔍 Memory recalled (exact): "${normalizedQuery}" → "${mem.value}"`);
    return mem;
  }

  // Fuzzy match — search keys and values
  for (const [key, entry] of memoryStore) {
    if (
      key.includes(normalizedQuery) ||
      normalizedQuery.includes(key) ||
      entry.value.toLowerCase().includes(normalizedQuery)
    ) {
      console.log(`🔍 Memory recalled (fuzzy): "${key}" → "${entry.value}"`);
      return entry;
    }
  }

  console.log(`🔍 Memory recall: no match for "${normalizedQuery}"`);
  return null;
}

/**
 * Get all stored memories as an array
 * @returns {Array<{key: string, value: string, created_at: string}>}
 */
export function getAllMemories() {
  return Array.from(memoryStore.values());
}

/**
 * Clear all memories
 */
export function clearMemory() {
  memoryStore.clear();
  console.log('🗑️  All memories cleared');
}

/**
 * Get the raw memory object for prompt injection
 * @returns {Object}
 */
export function getMemorySnapshot() {
  const snapshot = {};
  for (const [key, entry] of memoryStore) {
    snapshot[key] = entry.value;
  }
  return snapshot;
}
