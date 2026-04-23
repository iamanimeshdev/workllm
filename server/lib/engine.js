// ============================================================
// AI Engine — While-loop multi-step tool execution
// ============================================================

import { buildSystemPrompt } from './prompts.js';
import { getMemorySnapshot, storeMemory, recallMemory } from './memory.js';
import { executeTool } from '../tools/index.js';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_ITERATIONS = 10; // Increased limit for multi-step tasks

/**
 * Call the LLM via OpenRouter and get a raw string response
 */
async function callLLM(messages) {
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-4-maverick:free';
  console.log(`\n🤖 Calling LLM (${model})...`);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'WorkLLM',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('LLM returned empty response');
  }

  console.log(`📝 LLM raw response: ${content.substring(0, 200)}...`);
  return content;
}

/**
 * Parse JSON from LLM response, handling markdown fences and malformed output
 */
function parseLLMResponse(raw) {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch (_) {
    // ignore
  }

  // Try extracting from markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {
      // ignore
    }
  }

  // Try extracting first { ... } block
  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (_) {
      // ignore
    }
  }

  throw new Error(`Failed to parse LLM response as JSON: ${raw.substring(0, 300)}`);
}

/**
 * Validate the parsed JSON against our expected schema
 */
function validateResponse(parsed) {
  const validTools = ['send_email', 'draft_email', 'schedule_meeting', 'store_memory', 'recall_memory', 'final_answer'];

  if (!parsed.tool || !validTools.includes(parsed.tool)) {
    throw new Error(`Invalid tool: "${parsed.tool}". Must be one of: ${validTools.join(', ')}`);
  }

  // Ensure required fields exist with defaults
  return {
    thought: parsed.thought || null,
    tool: parsed.tool,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    args: parsed.args || {},
    missing_fields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
    follow_up_question: parsed.follow_up_question || null,
  };
}

/**
 * Main processing function — while-loop architecture
 * Keeps calling LLM and executing tools until the task is complete
 *
 * @param {string} userMessage - the user's natural language input
 * @param {Array} conversationHistory - previous messages for context
 * @returns {Object} - full execution result with steps
 */
export async function processMessage(userMessage, conversationHistory = []) {
  const steps = []; // Track all execution steps
  let iteration = 0;
  let isComplete = false;
  let finalResponse = null;

  // Build conversation for LLM
  const memorySnapshot = getMemorySnapshot();
  const systemPrompt = buildSystemPrompt(memorySnapshot);

  // Start with the conversation history + new user message
  const llmMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📨 User: "${userMessage}"`);
  console.log(`${'═'.repeat(60)}`);

  // ── While loop: keep processing until task is complete ──
  while (!isComplete && iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n── Iteration ${iteration}/${MAX_ITERATIONS} ──`);

    try {
      // 1. Call LLM
      const rawResponse = await callLLM(llmMessages);

      // Append assistant's response to history
      llmMessages.push({ role: 'assistant', content: rawResponse });

      // 2. Parse JSON
      const parsed = parseLLMResponse(rawResponse);

      // 3. Validate
      const validated = validateResponse(parsed);

      console.log(`🧠 Thought: ${validated.thought || 'None'}`);
      console.log(`🎯 Tool: ${validated.tool} | Confidence: ${validated.confidence}`);
      console.log(`📋 Args: ${JSON.stringify(validated.args)}`);
      console.log(`❓ Missing: ${JSON.stringify(validated.missing_fields)}`);

      // 4. Check for final_answer
      if (validated.tool === 'final_answer') {
        const step = {
          iteration,
          tool: validated.tool,
          confidence: validated.confidence,
          args: validated.args,
          missing_fields: [],
          follow_up_question: null,
          status: 'executed',
          result: 'Task complete',
        };
        steps.push(step);

        finalResponse = {
          type: 'success',
          message: validated.args.message || 'I have completed the task.',
          steps,
          total_iterations: iteration,
        };
        isComplete = true;
        continue;
      }

      // 5. Check for missing fields → return follow-up question
      if (validated.missing_fields.length > 0) {
        const step = {
          iteration,
          tool: validated.tool,
          confidence: validated.confidence,
          args: validated.args,
          missing_fields: validated.missing_fields,
          follow_up_question: validated.follow_up_question,
          status: 'needs_input',
          result: null,
        };
        steps.push(step);

        finalResponse = {
          type: 'follow_up',
          message: validated.follow_up_question || `I need more information: ${validated.missing_fields.join(', ')}`,
          steps,
          total_iterations: iteration,
        };
        isComplete = true;
        continue;
      }

      // 6. Execute tools
      let toolResultStr = '';
      if (validated.tool === 'store_memory') {
        const { key, value } = validated.args;
        storeMemory(key, value);
        toolResultStr = `Remembered: "${key}" = "${value}"`;
      } else if (validated.tool === 'recall_memory') {
        const { key, query } = validated.args;
        const searchKey = query || key || '';
        const recalled = recallMemory(searchKey);
        toolResultStr = recalled
          ? `Found: "${recalled.key}" = "${recalled.value}"`
          : `No memory found for "${searchKey}"`;
      } else {
        toolResultStr = await executeTool(validated.tool, validated.args);
      }

      const step = {
        iteration,
        tool: validated.tool,
        confidence: validated.confidence,
        args: validated.args,
        missing_fields: [],
        follow_up_question: null,
        status: 'executed',
        result: toolResultStr,
      };
      steps.push(step);

      // Feed result back to LLM to continue loop
      console.log(`🔄 Tool executed. Looping back with result...`);
      llmMessages.push({
        role: 'user',
        content: `System: Tool execution result for ${validated.tool}: ${toolResultStr}\n\nContinue with the next step. If all tasks are complete, use the 'final_answer' tool. Respond with ONLY a valid JSON object.`
      });

    } catch (error) {
      console.error(`❌ Iteration ${iteration} error:`, error.message);

      steps.push({
        iteration,
        tool: 'error',
        confidence: 0,
        args: {},
        missing_fields: [],
        follow_up_question: null,
        status: 'error',
        result: error.message,
      });

      // If we've had too many errors, bail out
      if (iteration >= MAX_ITERATIONS) {
        finalResponse = {
          type: 'error',
          message: `I encountered an error processing your request: ${error.message}`,
          steps,
          total_iterations: iteration,
        };
        isComplete = true;
      } else {
        // Retry — add error context to messages
        llmMessages.push({
          role: 'user',
          content: `Your previous response was not valid JSON. Please respond with ONLY a valid JSON object following the schema. Error: ${error.message}`,
        });
      }
    }
  }

  // Safety: if we hit max iterations without completing
  if (!isComplete) {
    finalResponse = {
      type: 'error',
      message: 'Maximum processing iterations reached. Please try rephrasing your request.',
      steps,
      total_iterations: iteration,
    };
  }

  console.log(`\n✅ Processing complete after ${iteration} iteration(s)`);
  console.log(`   Type: ${finalResponse.type}`);
  console.log(`   Steps: ${steps.length}`);

  return finalResponse;
}
