import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import memoryRouter from './routes/memory.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/memory', memoryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🤖 AI Assistant Server                ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Model: ${(process.env.OPENROUTER_MODEL || 'meta-llama/llama-4-maverick:free').substring(0, 30).padEnd(30)} ║
  ║   Mode: Strict JSON + While-Loop        ║
  ╚══════════════════════════════════════════╝
  `);
});
