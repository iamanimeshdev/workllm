// ============================================================
// Chat Route — POST /api/chat
// ============================================================

import express from 'express';
import { processMessage } from '../lib/engine.js';

const router = express.Router();

/**
 * POST /api/chat
 * Body: { message: string, conversationHistory: Array<{role, content}> }
 * Returns: Structured JSON with execution steps
 */
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        type: 'error',
        message: 'A "message" string is required in the request body.',
        steps: [],
        total_iterations: 0,
      });
    }

    const latestMessage = message.trim();
    console.log(`\n📨 Received: "${latestMessage}"`);

    // Process through the while-loop engine
    const result = await processMessage(latestMessage, conversationHistory || []);

    res.json(result);
  } catch (error) {
    console.error('❌ Chat endpoint error:', error);
    res.status(500).json({
      type: 'error',
      message: `Server error: ${error.message}`,
      steps: [],
      total_iterations: 0,
    });
  }
});

export default router;
