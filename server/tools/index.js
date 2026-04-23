// ============================================================
// Tool Router — Switch-based dispatch to tool handlers
// ============================================================

import { send_email, draft_email } from './email.js';
import { schedule_meeting } from './calendar.js';

/**
 * Execute a tool by name with the given arguments
 * @param {string} toolName - the tool to execute
 * @param {object} args - tool-specific arguments
 * @returns {Promise<string>} - human-readable result string
 */
export async function executeTool(toolName, args) {
  console.log(`\n⚡ Executing tool: ${toolName}`);
  console.log(`   Args: ${JSON.stringify(args)}`);

  switch (toolName) {
    case 'send_email':
      return await send_email(args);

    case 'draft_email':
      return await draft_email(args);

    case 'schedule_meeting':
      return await schedule_meeting(args);

    // store_memory and recall_memory are handled directly in engine.js
    // because they affect the loop control flow

    default:
      throw new Error(`Unknown tool: "${toolName}"`);
  }
}
