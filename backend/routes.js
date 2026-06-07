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

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    
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

// AI Chat Partner Route
router.post('/ai/chat', async (req, res) => {
  const { messages, currentDay, code, logs } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      text: "🤖 **AI Partner (Offline)**: Hi! I see you are on Day " + (currentDay || 1) + ". Please set your `GEMINI_API_KEY` in `.env` to start chatting with me live. For now, try running your code to test your understanding!"
    });
  }
  try {
    const systemPrompt = `You are a supportive, friendly AI coding partner sitting next to the student in a JavaScript Masterclass.
They are currently on Day ${currentDay || 1} of the course.
Their active code in the workspace editor is:
\`\`\`javascript
${code || '// No code written yet'}
\`\`\`
Their console execution logs are:
\`\`\`
${logs && logs.length > 0 ? logs.join('\\n') : 'No output logs yet'}
\`\`\`

YOUR BEHAVIOR:
1. Be encouraging, positive, and conversational. Use friendly space-vibes or coder-vibes.
2. Tutor Mode: Do NOT directly solve coding challenges or provide complete copy-paste answers if they ask you to write the solution. Guide them, explain syntax rules, and provide helpful code snippets or hints.
3. Keep answers concise, highly readable, and formatted in Markdown.`;

    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    if (messages && messages.length > 0) {
      messages.forEach(msg => {
        formattedContents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedContents })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    res.json({ text });
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Debugger Route
router.post('/ai/debug', async (req, res) => {
  const { code, logs, desc } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      explanation: "🤖 **AI Debugger (Offline)**: Check your console logs. If your output is empty, ensure you call `console.log()` to print your result. If you see a syntax or type error, verify your brackets, assignment variables, and scope declarations!"
    });
  }
  try {
    const prompt = `The student is trying to solve this coding challenge: "${desc}".
Their code is:
\`\`\`javascript
${code}
\`\`\`
Their failing console output/errors are:
\`\`\`
${logs && logs.length > 0 ? logs.join('\\n') : 'No output logs'}
\`\`\`

Identify the bug, explain what went wrong conceptually, and provide a clear, helpful clue or hint.
CRITICAL: Do NOT write the correct code solution. Let them write the code themselves. Keep the explanation very brief and encouraging.`;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }
    const explanation = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to debug code.';
    res.json({ explanation });
  } catch (err) {
    console.error("AI Debug Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Flashcards Route
router.post('/ai/flashcards', async (req, res) => {
  const { day } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  const mockFlashcards = {
    1: [
      { question: "Why is running raw C++ in the browser a security hazard?", answer: "C++ has no native sandboxing. It allows direct system calls, which would let malicious websites delete files, execute OS commands, or access system memory." },
      { question: "Who created JavaScript and how long did it take?", answer: "Brendan Eich created the prototype of JavaScript in just 10 days in May 1995 while working at Netscape." },
      { question: "What does the browser sandbox prevent?", answer: "It isolates code execution from the host operating system, preventing scripts from reading/writing files or executing system calls on the user's computer." },
      { question: "What is the role of the Garbage Collector in JS?", answer: "It automatically monitors memory references, identifies variables/objects that are no longer reachable, and frees their memory block." },
      { question: "Why was JS named 'JavaScript'?", answer: "It was a marketing tactic by Netscape to ride on the popularity of Java at the time. They are completely different languages." }
    ],
    2: [
      { question: "What is the Temporal Dead Zone (TDZ)?", answer: "The state between a block scope starting and a let/const variable being declared. Accessing the variable during this time throws a ReferenceError." },
      { question: "What are the 7 primitive types in JavaScript?", answer: "string, number, boolean, null, undefined, bigint, and symbol." },
      { question: "How does 'const' handle object immutability?", answer: "Const only keeps the stack reference pointer immutable. The actual object properties stored in the heap remain fully mutable." },
      { question: "Why does 'typeof null' return 'object'?", answer: "It is a 30-year-old tag bug in the original JS engine where the type tag for objects matched null (all zeros). It cannot be fixed without breaking old websites." },
      { question: "What is the key difference between Stack and Heap memory?", answer: "Stack stores small, fixed-size primitive values and execution frames (fast access). Heap stores large, dynamic, variable-sized objects (referenced by address)." }
    ],
    3: [
      { question: "Why does '0.1 + 0.2 !== 0.3' in JavaScript?", answer: "Numbers are stored in IEEE-754 double-precision floating point format (binary). Fractions like 0.1 and 0.2 cannot be represented precisely in binary, leading to tiny rounding errors." },
      { question: "How does loose equality (==) compare different types?", answer: "It uses implicit type coercion to convert both values to a common primitive type (usually numbers) before making the comparison." },
      { question: "Name the 6 falsy values in JavaScript.", answer: "false, 0, '' (empty string), null, undefined, and NaN." },
      { question: "What is relational comparison behavior for strings?", answer: "Relational comparisons (<, >) check strings lexicographically (alphabetical order, character-by-character based on Unicode values)." },
      { question: "What is short-circuit evaluation in logical operators?", answer: "In '&&', if the left is falsy, it returns it immediately without checking the right. In '||', if the left is truthy, it returns it immediately." }
    ],
    4: [
      { question: "What is string immutability?", answer: "Strings are primitive values and cannot be modified in place. Any string operations (like toUpperCase) return a brand new string." },
      { question: "What is the risk of an infinite loop?", answer: "It runs infinitely, blocking the single-threaded event loop, freezing the browser's main UI thread, and crashing the tab." },
      { question: "How do you generate a random integer between min and max (inclusive)?", answer: "Use: Math.floor(Math.random() * (max - min + 1)) + min" },
      { question: "What is the difference between a while and a do-while loop?", answer: "A while loop checks the condition first. A do-while loop runs the code block once before checking, guaranteeing at least one execution." },
      { question: "What does string.slice(start, end) do?", answer: "It extracts a section of a string from the start index up to (but not including) the end index, returning it as a new string." }
    ]
  };

  if (!apiKey) {
    return res.json({ flashcards: mockFlashcards[day] || mockFlashcards[1] });
  }
  try {
    const prompt = `Generate 5 high-quality review flashcards for Day ${day} of a JavaScript course.
Day topics review context:
- Day 1: JS history (Brendan Eich 10 days), C++ browser security hazards, 1995 PC memory constraints, sandboxing, automatic garbage collection.
- Day 2: Dynamic typing, variable declarations (var vs let vs const), Temporal Dead Zone, 7 primitive types, typeof null bug, Stack vs Heap referencing.
- Day 3: Operators, loose vs strict equality, relational comparison algorithms, logical operators short-circuiting, falsy list (6 values), explicit type casting.
- Day 4: Conditionals, loops (for, while, do-while), infinite loops, IEEE-754 precision errors (0.1+0.2), Math.random range shifting, string immutability, string methods.

Return the result strictly as a valid JSON array of objects. Do NOT wrap it in markdown block quotes or extra text. Format must match this exact schema:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const flashcards = JSON.parse(text);
    res.json({ flashcards });
  } catch (err) {
    console.warn("Gemini Flashcards failed or JSON parse failed. Serving fallback mock cards.", err);
    res.json({ flashcards: mockFlashcards[day] || mockFlashcards[1] });
  }
});

// AI Quiz Route
router.post('/ai/quiz', async (req, res) => {
  const { day } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "API Key required for dynamic quiz generation." });
  }

  try {
    const prompt = `Generate a 5-question multiple choice quiz testing JavaScript concepts from Day ${day} of our syllabus.
Syllabus details:
- Day 1: Sandboxing, C++ dangers, 10 days Brendan Eich, Garbage collection.
- Day 2: var vs let vs const, TDZ, Stack vs Heap, 7 Primitives, typeof null.
- Day 3: == vs === coercion, relational checks, logical operators, short-circuit, falsy values.
- Day 4: loops (for/while/do-while), Math.random formula, string immutability, string methods.

Each question must have:
- 'q': The question string.
- 'options': An array of exactly 4 strings.
- 'answer': An integer index (0, 1, 2, or 3) representing the correct option.
- 'explanation': A detailed explanation of why that answer is correct.

Return the result strictly as a valid JSON array of objects. Do NOT wrap it in markdown code blocks or extra text. Format must match this exact schema:
[
  {
    "q": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 1,
    "explanation": "Explanation here..."
  }
]`;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (err) {
    console.error("AI Quiz Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Facts for landing page
router.get('/facts', (req, res) => {
  res.json({ facts: FLASH_FACTS });
});

export default router;
