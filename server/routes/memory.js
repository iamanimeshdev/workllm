// ============================================================
// Memory Route — GET/DELETE /api/memory
// ============================================================

import express from 'express';
import { getAllMemories, clearMemory } from '../lib/memory.js';

const router = express.Router();

// Get all stored memories
router.get('/', (req, res) => {
  try {
    const memories = getAllMemories();
    res.json({ memories, count: memories.length });
  } catch (error) {
    console.error('Memory fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all memories
router.delete('/', (req, res) => {
  try {
    clearMemory();
    res.json({ success: true, message: 'All memories cleared' });
  } catch (error) {
    console.error('Memory clear error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
