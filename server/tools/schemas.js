import { z } from 'zod';

export const schemas = {
  send_email: z.object({
    to: z.array(z.string()).describe("Array of recipient names, groups, or email addresses"),
    subject: z.string().optional().describe("Email subject line"),
    body: z.string().describe("The content/body of the email"),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
  }),
  draft_email: z.object({
    to: z.array(z.string()).describe("Array of recipient names or emails"),
    subject: z.string().optional(),
    body: z.string().optional(),
    cc: z.array(z.string()).optional(),
  }),
  schedule_meeting: z.object({
    participants: z.array(z.string()).describe("Array of participant names or emails"),
    duration_minutes: z.number().optional().default(30),
    date: z.string().optional().describe("Date of the meeting, e.g., 'next Tuesday' or '2026-04-24'"),
    time_preference: z.string().optional().describe("Preferred time, e.g., 'morning', '3 PM'"),
    agenda: z.string().optional(),
    selected_slot: z.string().optional().describe("A specific date/time slot string if a common one is found"),
  }),
  save_memory: z.object({
    key: z.string().describe("Short descriptive key for the memory (e.g., 'rahul_email')"),
    value: z.string().describe("The information to remember"),
    category: z.enum(["contacts", "preferences", "notes", "general"]).optional().default("general"),
  }),
  recall_memory: z.object({
    query: z.string().describe("Search keyword(s) to find relevant saved memories"),
  })
};
