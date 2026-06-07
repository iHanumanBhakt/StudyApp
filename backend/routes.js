import express from 'express';
import * as db from './db.js';

const router = express.Router();

const FLASH_FACTS = [
  "JavaScript was created in just 10 days in May 1995 by Brendan Eich at Netscape.",
  "CSS stands for Cascading Style Sheets. The 'cascading' refers to the order rules are applied.",
  "HTTP is stateless. Each request from a client is executed independently without prior context.",
  "Docker containerizes code, packaging it with all dependencies so it runs identically on any OS.",
  "Horizontal scaling adds more machines to a pool, while vertical scaling adds power (CPU/RAM) to one server.",
  "typeof null returns 'object' because of a 30-year-old bug in the initial JavaScript implementation.",
  "DNS (Domain Name System) acts as the phonebook of the internet, converting domain names to IP addresses.",
  "The first web page went live in 1991, hosted on a NeXT computer by Tim Berners-Lee at CERN.",
  "A database index speeds up search queries at the cost of slower writes and additional disk storage.",
  "0.1 + 0.2 !== 0.3 because numbers are stored in binary IEEE-754 format, leading to rounding inaccuracies.",
  "Git was created in 2005 by Linus Torvalds, the creator of Linux, to manage Linux kernel development.",
  "Responsive web design uses media queries to adjust layout styling based on the user's viewport width."
];

// Auth Routes
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await db.registerUser(username, password);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await db.loginUser(username, password);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User Stats/Progress Routes
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await db.getUserProfile(req.params.username);
    res.json({
      username: user.username,
      points: user.points,
      currentDay: user.currentDay,
      badges: user.badges,
      completedExercises: user.completedExercises,
      joinedAt: user.joinedAt
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/progress', async (req, res) => {
  const { username, currentDay } = req.body;
  if (!username || !currentDay) {
    return res.status(400).json({ error: 'Username and day index are required' });
  }
  try {
    const user = await db.updateUserProgress(username, parseInt(currentDay));
    res.json({ currentDay: user.currentDay });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Exercise Submission Route
router.post('/exercises/submit', async (req, res) => {
  const { username, dayKey, exerciseIndex, code, points } = req.body;
  if (!username || !dayKey || exerciseIndex === undefined || points === undefined) {
    return res.status(400).json({ error: 'Missing submission parameters' });
  }
  try {
    const result = await db.submitExercise(username, dayKey, exerciseIndex, code, parseInt(points));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Leaderboard Route
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.getLeaderboard();
    // Exclude passwords
    const cleanList = leaderboard.map(l => ({
      username: l.username,
      points: l.points,
      currentDay: l.currentDay,
      completedCount: l.completedExercises.length,
      badges: l.badges
    }));
    res.json(cleanList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Explainer Route using Gemini API
router.post('/ai/explain', async (req, res) => {
  const { code, logs, desc } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required for AI analysis' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Local mock analysis for offline presentation robustness
    console.log("No GEMINI_API_KEY found. Serving local mockup feedback.");
    
    let mockExplanation = "🤖 **AI Tutor (Offline Demo Mode)**:\n\nIt looks like you're writing some JavaScript! Here's a review of your code:\n\n1. **Structure Check**: Make sure your logic corresponds exactly to the exercise requirements.\n2. **Standard Output**: If you're printing results, ensure you call \`console.log()\` explicitly.\n3. **Scope Variable rules**: If you're modifying const references or entering temporal dead zones, verify declarations.\n\n*Note: Set the `GEMINI_API_KEY` environment variable in your terminal environment to activate live Gemini AI feedback!*";
    
    return res.json({ explanation: mockExplanation });
  }

  try {
    const prompt = `You are a supportive, professional JavaScript tutor helping a beginner student. They are working on the following coding challenge: "${desc}".
Their current workspace code is:
\`\`\`javascript
${code}
\`\`\`
Their console output/errors are:
\`\`\`
${logs && logs.length > 0 ? logs.join('\\n') : 'No output logs yet'}
\`\`\`

YOUR RULES AND BEHAVIOR:
1. Scope Constraint: You must ONLY talk about topics covered in JavaScript Day 1 to Day 4 (variables, block scopes let/const/var, Temporal Dead Zone, primitive data types (string, number, boolean, null, undefined, bigint, symbol), mutability, Stack vs Heap, loose vs strict comparisons, type coercion rules, conditionals, loops (for, while, do-while), IEEE-754 binary truncation floating point errors, Math random formulas, and basic String indexing methods).
2. If the student's code, error, or implicit request is completely unrelated to JavaScript Day 1 to Day 4 (e.g. asking about HTML/CSS, React, SQL, backend databases, other languages like Python/Java, or general non-programming topics), politely refuse to answer and guide them back to their Day 1-4 JavaScript course topics.
3. Code-Writing Restriction: Do NOT write the final correct solution code for the student under any circumstances. You must act as a tutor—point out where their logic or syntax is failing, explain the underlying rule (e.g. scope rules or coercion algorithms), and provide a helpful clue or hint so they can correct it themselves.
4. Keep the explanation brief, encouraging, clear, and formatted nicely in Markdown.`;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from Gemini.';
    res.json({ explanation: text });

  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: 'Failed to contact Gemini AI: ' + err.message });
  }
});

// Facts for landing page
router.get('/facts', (req, res) => {
  res.json({ facts: FLASH_FACTS });
});

export default router;
