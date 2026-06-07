import React, { useState, useEffect, useRef } from 'react';
import V8CompilerSim from './V8CompilerSim';
import MemorySim from './MemorySim';
import CoercionSim from './CoercionSim';
import MathSim from './MathSim';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Expanded day content database: Detailed Theory with Runnable code snippets
const DAYS_LESSONS = {
  1: {
    title: "Introduction to JavaScript & Security",
    theory: [
      {
        h: "1. Why JavaScript Exists & The 1995 Web War",
        body: "In the early 1990s, web pages were completely static documents. There was no client-side interaction. If a user filled out a form and made a single mistake, the page had to ship the data all the way to a distant server and wait for the server to reply. Netscape realized the web needed to come alive instantly. Sun Microsystems was pushing Java for heavy work, but Netscape needed a lightweight 'glue language' that web designers could write. Brendan Eich was hired and wrote the prototype of JavaScript in just 10 days in May 1995. The name 'JavaScript' was a pure marketing tactic to ride on Java's popularity; they are completely unrelated. As the saying goes: 'Java and JavaScript are as related as Car and Carpet'.",
        code: `// Run standard console output statements\nconsole.log("Hello, I was created in 10 days!");\nconsole.log("Java and JavaScript are as related as Car and Carpet.");`
      },
      {
        h: "2. Why We Cannot Put C++ in the Browser",
        body: "C++ is a compiled language that gives programmers low-level control over hardware, memory addresses, and system registers. Running arbitrary C++ code from a website would be a security nightmare: (1) File access: A web page could read/write/delete any file on your computer, stealing cookies or system passwords. (2) OS Commands: It could execute system commands like 'rm -rf /' (Linux) or format drives. (3) Pointer arithmetic: It could overwrite kernel memory or peek into other running apps. JavaScript solves this by running inside a sandboxed environment that blocks all direct OS calls.",
        code: `// JavaScript runs in a secure sandbox.\n// Attempting direct OS commands will throw errors or fail silently.\ntry {\n  const fs = require('fs'); // Node-specific module, fails in browsers\n  fs.writeFileSync('secrets.txt', 'compromised data');\n} catch(err) {\n  console.log("Blocked by sandbox safety! Error: " + err.message);\n}`
      },
      {
        h: "3. 1995 PC Hardware Constraints",
        body: "A typical home PC in 1995 had only 4 MB to 8 MB of RAM, 200 MB to 500 MB of hard disk space, and an Intel Pentium 75-133 MHz CPU. Running heavy runtimes, compilers, or native sandboxed C++ engines would eat up all system memory and freeze the computer. Browsers had to stay lightweight, which is why JavaScript was designed as a lightweight, interpreted, memory-safe scripting engine."
      },
      {
        h: "4. Automatic Memory Management (Garbage Collection)",
        body: "Unlike C++ where developers must manually allocate and free memory (using malloc/free or new/delete), JavaScript handles memory management automatically. The JS Engine runs a background process called the Garbage Collector. It monitors variables and objects in memory, determines which ones are no longer referenced by the code, and releases their memory slot automatically. This reduces manual bugs like memory leaks."
      }
    ],
    exercise: {
      desc: "Write a program that prints 'Hello World' and 'JavaScript is awesome' on separate lines using console.log().",
      startCode: `// Write your code below\nconsole.log("Hello World");\n`,
      validate: (logs) => {
        const joined = logs.join('\n').toLowerCase();
        return joined.includes("hello world") && joined.includes("javascript is awesome");
      },
      hint: "Use console.log('Hello World') on line 2, and console.log('JavaScript is awesome') on line 3."
    }
  },
  2: {
    title: "Variables, Scopes & Data Types",
    theory: [
      {
        h: "1. The Original Memory Problem",
        body: "Computer RAM is just a massive sequence of bytes (0s and 1s). The hardware has no idea what kind of data it represents. For example, the bits '01001000' could mean the integer 72, the character 'H', a boolean 'true', or a stack memory address. Data Types were invented as labels to tell the computer: (1) How many bytes to read for this value, and (2) What operations are allowed on it. JavaScript is dynamically typed, meaning variables can hold any data type and resolve it on the fly at runtime.",
        code: `// Dynamic typing in JavaScript\nlet data = 100; // number type\nconsole.log(typeof data); // "number"\ndata = "hello"; // string type\nconsole.log(typeof data); // "string"`
      },
      {
        h: "2. Variable Declarations (var, let, const)",
        body: "(1) const: Declares block-scoped constants. Reassignment is not allowed and initialization is mandatory. Const only ensures the reference pointer in the stack is immutable. If a const holds an array or object, the inner properties remain fully mutable. (2) let: Declares block-scoped variables that can be reassigned. (3) var: Discouraged function-scoped variables. They leak outside 'if' or 'for' blocks and are initialized with 'undefined' when hoisted, allowing you to access them before declaration.",
        code: `// Modify const objects\nconst config = { port: 8080 };\nconfig.port = 3000; // Allowed! Reference remains same.\nconsole.log("Port changed to:", config.port);\n\ntry {\n  config = { port: 9000 }; // Throws TypeError because of reassignment\n} catch(err) {\n  console.log("Reassignment failed: " + err.message);\n}`
      },
      {
        h: "3. The Temporal Dead Zone (TDZ)",
        body: "Unlike var, variables declared with let and const are hoisted to the top of their block but are not initialized. They are in the Temporal Dead Zone (TDZ) from the beginning of the block until the engine parses their declaration statement. Accessing a let/const variable inside the TDZ throws a ReferenceError.",
        code: `// TDZ Visualizer\ntry {\n  console.log(myVar); // ReferenceError: Cannot access before initialization\n  let myVar = 50;\n} catch(err) {\n  console.log("TDZ Block Alert: " + err.message);\n}`
      },
      {
        h: "4. The 7 Primitive Types in Detail",
        body: "Primitives are immutable values stored directly on the Stack. (1) string: Represents text. (2) number: Unified double-precision 64-bit float. No distinction between int and float. Contains Infinity, -Infinity, and NaN. (3) boolean: logical true or false. (4) undefined: Unintentional absence of value. (5) null: Intentional absence of value. (6) bigint: Holds whole numbers larger than 2^53-1, written with 'n' suffix. (7) symbol: Factory-created Symbol() unique keys.",
        code: `// Primitive Types Sandbox\nlet str = "Alice";\nlet num = 3.14;\nlet notANumber = NaN;\nlet largeNumber = 9007199254740991n;\nlet uniqueKey = Symbol("id");\n\nconsole.log(typeof str, typeof num, typeof notANumber);\nconsole.log(typeof largeNumber, typeof uniqueKey);`
      },
      {
        h: "5. Objects (Non-Primitive) & The typeof null Bug",
        body: "Objects are mutable collections of key-value pairs. Variables hold a memory pointer reference to the object inside the Heap. Copying an object copies the pointer, meaning both variables modify the same memory cell. typeof null returns 'object' because of a 30-year-old tag bug in the original engine where the type tag for objects matched null (all 0s). This bug cannot be fixed because it would break millions of older websites.",
        code: `// Passed by Reference\nlet obj1 = { value: 10 };\nlet obj2 = obj1;\nobj2.value = 20;\nconsole.log("obj1 value modified: ", obj1.value); // Outputs: 20\nconsole.log("typeof null bug returns: ", typeof null);`
      }
    ],
    exercise: {
      desc: "Declare a block-scoped variable named 'score' using let with an initial value of 100. Reassign its value to 250, then log 'score' to the console.",
      startCode: `// Write your let variable, reassign it, and print it\n`,
      validate: (logs) => {
        return logs.some(l => l.trim() === "250");
      },
      hint: "Use 'let score = 100;', then on the next line write 'score = 250;', and finally 'console.log(score);'."
    }
  },
  3: {
    title: "Operators & Type Coercion",
    theory: [
      {
        h: "1. Operators, Shorthands & Precedence",
        body: "An operator is a symbol (like +, -, *) that performs operations on values called operands. (1) Assignment: '='. (2) Compound Shorthands: +=, -=, *=, /=, %=, **= combine math and assignment. (3) Prefix vs Postfix: i++ (postfix) returns the original value first and then increments. ++i (prefix) increments first and returns the new value. (4) Precedence: Multiplicative operators (*, /, %) have higher precedence than additive ones (+, -). Parentheses () override default order.",
        code: `// Precedence and Incrementers\nlet postfix = 5;\nconsole.log("postfix++ logs: ", postfix++); // Prints 5, then becomes 6\n\nlet prefix = 5;\nconsole.log("++prefix logs: ", ++prefix); // Increments first, prints 6\n\nconsole.log("Override order (2 + 3) * 5: ", (2 + 3) * 5);`
      },
      {
        h: "2. Loose (==) vs. Strict (===) Equality",
        body: "Loose equality (==) performs type coercion (automatic conversion) before comparing, leading to confusing bugs. Strict equality (===) compares both value and type without coercion, returning false if they differ. Rule 2: null and undefined are loosely equal only to each other. Rule 4: If a boolean is compared, it converts to a number (true -> 1, false -> 0). Rule 5: If an object is compared, it converts to primitive via valueOf/toString first.",
        code: `// Equality Coercion\nconsole.log("'10' == 10 returns: ", '10' == 10); // true\nconsole.log("'10' === 10 returns: ", '10' === 10); // false\nconsole.log("[] == false returns: ", [] == false); // true\nconsole.log("null == undefined returns: ", null == undefined); // true`
      },
      {
        h: "3. Relational Comparison Algorithm",
        body: "Relational operators (<, >, <=, >=) compare values. Rule 1: If both are strings, it performs alphabetical lexicographical check character-by-character. Rule 2: Otherwise, both sides convert to numbers (null -> 0, undefined -> NaN, true -> 1). Special Case: If either value becomes NaN, relational comparison always evaluates to false (even NaN >= NaN is false).",
        code: `// Relational comparisons\nconsole.log("'apple' < 'banana' returns: ", 'apple' < 'banana'); // true\nconsole.log("null >= 0 returns: ", null >= 0); // true (null coerced to 0)\nconsole.log("undefined > 0 returns: ", undefined > 0); // false (undefined coerced to NaN)`
      },
      {
        h: "4. Logical Operators & Short-Circuiting",
        body: "Logical operators combine boolean statements. (1) AND (&&): Returns true if both are truthy. Short-circuit: If the left side is falsy, the engine stops and never evaluates the right side. (2) OR (||): Returns true if either is truthy. Short-circuit: If left is truthy, right is skipped. Commonly used for default values (e.g., let name = inputName || 'Guest'). (3) NOT (!): Inverts boolean state.",
        code: `// Short-circuiting evaluation\nlet user = null;\n// Below line is safe, does not throw error since user is null and execution stops\nlet name = user && user.profile.name;\nconsole.log("name resolves to: ", name); // null\n\nlet defaultName = "" || "Guest";\nconsole.log("defaultName resolves to: ", defaultName); // "Guest"`
      },
      {
        h: "5. Explicit Type Casting & Truthy/Falsy",
        body: "Explicit conversion is the professional way to convert types using wrapper functions: Number(), String(), Boolean(), parseInt(), parseFloat(), or unary plus +. Falsy list: Exactly 6 values are falsy in JS: false, 0, '' (empty string), null, undefined, and NaN. All other values are truthy, including empty arrays [] and empty objects {}.",
        code: `// Explicit conversions\nconsole.log(Number("123.45")); // 123.45\nconsole.log(parseInt("100px")); // 100\nconsole.log(Boolean([])); // true (an empty array is truthy!)\nconsole.log(Boolean("")); // false`
      }
    ],
    exercise: {
      desc: "Fix the floating-point calculation! Add 0.1 and 0.2 together, format the sum to 2 decimal places using .toFixed(2), and log the result to the console.",
      startCode: `// Fix the floating point calculation and log it\nlet sum = 0.1 + 0.2;\n`,
      validate: (logs) => {
        return logs.some(l => l.trim() === "0.30");
      },
      hint: "Call sum.toFixed(2) inside your console.log statement: console.log(sum.toFixed(2));"
    }
  },
  4: {
    title: "Conditionals, Loops, Math & Strings",
    theory: [
      {
        h: "1. Control Flow & Loops (for, while, do-while)",
        body: "(1) Conditionals: if, else if, else chain decisions sequentially from top to bottom. (2) for: Best when count is known. Has initialization, condition, and increment expression. (3) while: Runs as long as condition evaluates to true. Initialization must be declared before, and loop increment inside. Warning: forgetting the increment statement creates an infinite loop that locks the browser tab. (4) do-while: Runs the block once before checking condition, guaranteeing at least one execution cycle.",
        code: `// Descent loops implementation\nconsole.log("Descending countdown:");\nfor (let i = 3; i >= 1; i--) {\n  console.log(i);\n}`
      },
      {
        h: "2. The Math Object & Bounded Randomness",
        body: "JavaScript provides a built-in Math object. (1) Rounding: Math.round() rounds to nearest, Math.floor() rounds down, Math.ceil() rounds up, Math.trunc() removes decimal parts. (2) Abs, Max, Min: Math.abs() absolute value, Math.max() largest parameters, Math.min() smallest parameters. (3) Randomness: Math.random() returns a float between 0 (inclusive) and 1 (exclusive). To get a random integer between min and max (inclusive), use: Math.floor(Math.random() * (max - min + 1)) + min.",
        code: `// Math object capabilities\nconsole.log("PI: ", Math.PI);\nconsole.log("Floor of 4.7 is: ", Math.floor(4.7));\nconsole.log("Ceil of 4.2 is: ", Math.ceil(4.2));\n\n// Generate random numbers between 1 and 6 (dice roll)\nlet diceRoll = Math.floor(Math.random() * 6) + 1;\nconsole.log("Dice roll result: ", diceRoll);`
      },
      {
        h: "3. String Immutability & Indexing",
        body: "Strings are primitive types, meaning they are immutable. Once created, they cannot be changed in place. Attempting to assign character index (str[0] = 'A') fails silently. All string operations return a new string in a different memory slot, leaving the original string unmodified.",
        code: `// Immutability test\nlet name = "alex";\nname[0] = "A"; // Fails silently, does nothing\nconsole.log("Name remains: ", name); // "alex"\n\nlet uppercaseName = name.toUpperCase(); // Returns brand-new string\nconsole.log("Uppercase name: ", uppercaseName); // "ALEX"`
      },
      {
        h: "4. String Built-in Methods in Detail",
        body: "(1) Case: .toUpperCase() and .toLowerCase() return capitalized/lowered copies. (2) Substrings: .indexOf(sub) returns start position, .lastIndexOf(sub) returns last position, .includes(sub) checks containment. (3) Extraction: .slice(start, end) extracts sections (accepts negative indexes counting from end). (4) Replace: .replace(val, new) swaps first match, .replaceAll(val, new) swaps all matches. (5) Whitespace: .trim() removes margins. (6) Array conversion: .split(separator) splits string into array chunks.",
        code: `// String methods sandbox\nlet sentence = "   The quick brown fox jumps over the lazy fox.   ";\nlet trimmed = sentence.trim();\nconsole.log("Trimmed: ", trimmed);\nconsole.log("Contains 'fox'?: ", trimmed.includes("fox"));\nconsole.log("Splitting words: ", trimmed.split(" ").slice(0, 4));`
      }
    ],
    exercise: {
      desc: "Write a loop that prints the numbers from 5 down to 1 (inclusive) in descending order to the console, one number per line.",
      startCode: `// Write a loop in descending order\n`,
      validate: (logs) => {
        const joined = logs.join(',');
        return joined.includes("5,4,3,2,1") || (logs[0] === '5' && logs[1] === '4' && logs[2] === '3' && logs[3] === '2' && logs[4] === '1');
      },
      hint: "Use a for loop: for(let i = 5; i >= 1; i--) { console.log(i); }"
    }
  }
};

const DayModule = ({ day, user, onBack, onUpdatePoints }) => {
  const [activeSubTab, setActiveSubTab] = useState('theory'); // 'theory', 'simulator', 'practice'
  const [code, setCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [exerciseStatus, setExerciseStatus] = useState('idle'); // 'idle', 'running', 'success', 'fail'
  const [showHint, setShowHint] = useState(false);
  const [ideAlert, setIdeAlert] = useState('');

  // AI Tutor Integration States
  const [consoleTab, setConsoleTab] = useState('console'); // 'console' or 'ai'
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [editorHeight, setEditorHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const instructionsHeight = instructionsRef.current ? instructionsRef.current.offsetHeight : 0;
        const newHeight = e.clientY - rect.top - instructionsHeight;
        
        const minHeight = 80;
        const maxHeight = rect.height - instructionsHeight - 120; // safe space for actions and console
        
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setEditorHeight(newHeight);
        } else if (newHeight < minHeight) {
          setEditorHeight(minHeight);
        } else if (newHeight > maxHeight) {
          setEditorHeight(maxHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const lesson = DAYS_LESSONS[day];

  useEffect(() => {
    setCode(lesson.exercise.startCode);
    setConsoleLogs([]);
    setIsSuccess(false);
    setExerciseStatus('idle');
    setShowHint(false);
    setIdeAlert('');
    setConsoleTab('console');
    setAiFeedback('');
    setAiLoading(false);
    setAiError('');
  }, [day]);

  // Copies a code snippet directly into the IDE and switches sub-tab to practice
  const handleTryInIDE = (snippetCode) => {
    setCode(snippetCode);
    setActiveSubTab('practice');
    setConsoleLogs([]);
    setExerciseStatus('idle');
    setIdeAlert('Snippet copied to editor workspace!');
    setTimeout(() => {
      setIdeAlert('');
    }, 3000);
  };

  const askGemini = () => {
    setConsoleTab('ai');
    setAiLoading(true);
    setAiFeedback('');
    setAiError('');

    fetch(`${API_BASE_URL}/api/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        logs: consoleLogs,
        desc: lesson.exercise.desc
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to explain code');
      }
      return data;
    })
    .then((data) => {
      setAiFeedback(data.explanation);
      setAiLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setAiError(err.message);
      setAiLoading(false);
    });
  };

  const runCode = () => {
    setIdeAlert('');
    setExerciseStatus('running');
    const logs = [];
    
    // Custom print capture function
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(a => {
          if (a === null) return 'null';
          if (a === undefined) return 'undefined';
          if (typeof a === 'object') return JSON.stringify(a);
          return String(a);
        }).join(' '));
      },
      error: (...args) => {
        logs.push('[ERROR] ' + args.join(' '));
      }
    };

    try {
      const runner = new Function('console', code);
      runner(customConsole);

      setConsoleLogs(logs);

      // Validate challenge output
      const passed = lesson.exercise.validate(logs);
      if (passed) {
        setExerciseStatus('success');
        setIsSuccess(true);
        
        // Save score to backend
        fetch(`${API_BASE_URL}/api/exercises/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            dayKey: `day${day}`,
            exerciseIndex: 1,
            code: code,
            points: 100
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.points !== undefined) {
            onUpdatePoints(data.points, data.badges, data.completedExercises);
            if (day === user.currentDay && day < 4) {
              fetch(`${API_BASE_URL}/api/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: user.username,
                  currentDay: day + 1
                })
              });
            }
          }
        })
        .catch(err => {
          console.error("Backend error submitting exercise:", err);
          const newPoints = user.points + 100;
          const nextDay = Math.max(user.currentDay, day === user.currentDay && day < 4 ? day + 1 : user.currentDay);
          const badgeMap = { 1: "Sandbox Safe", 2: "Memory Master", 3: "Float Fixer", 4: "Loop Legend" };
          const newBadge = badgeMap[day];
          const updatedBadges = user.badges.includes(newBadge) ? user.badges : [...user.badges, newBadge];
          onUpdatePoints(newPoints, updatedBadges, [...user.completedExercises, `day${day}_ex1`]);
        });

      } else {
        setExerciseStatus('fail');
        if (logs.length === 0) {
          setConsoleLogs(["[SYSTEM] Code executed successfully, but nothing was output to console.log(). Make sure to log your results!"]);
        }
      }
    } catch (err) {
      setExerciseStatus('fail');
      setConsoleLogs([`[COMPILER ERROR] ${err.message}`]);
    }
  };

  const getSimulatorComponent = () => {
    switch (day) {
      case 1: return <V8CompilerSim />;
      case 2: return <MemorySim />;
      case 3: return <CoercionSim />;
      case 4: return <MathSim />;
      default: return null;
    }
  };

  return (
    <div className="learn-container">
      {/* Left Column: Lesson Content */}
      <div className="learn-sidebar">
        <button 
          className="btn-neon" 
          onClick={onBack}
          style={{ padding: '6px 14px', fontSize: '12px', marginBottom: '20px' }}
        >
          ← Dashboard
        </button>

        <h2 style={{ fontSize: '26px', marginBottom: '20px' }}>
          Day {day}: {lesson.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {lesson.theory.map((sec, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #1c1c1f', paddingBottom: '20px' }}>
              <h4 style={{ fontSize: '18px', color: 'var(--neon-blue)', marginBottom: '10px' }}>
                {sec.h}
              </h4>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'normal', marginBottom: sec.code ? '15px' : '0' }}>
                {sec.body}
              </p>
              
              {/* Runnable Code Snippet Block */}
              {sec.code && (
                <div style={{ position: 'relative', background: '#070709', border: '1px solid #222', borderRadius: '6px', overflow: 'hidden', margin: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f0f13', padding: '6px 15px', borderBottom: '1px solid #222' }}>
                    <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace', textTransform: 'uppercase' }}>Runnable Snippet</span>
                    <button 
                      className="btn-neon-blue" 
                      onClick={() => handleTryInIDE(sec.code)}
                      style={{ padding: '4px 8px', fontSize: '10px', textTransform: 'none', letterSpacing: '1px' }}
                    >
                      🚀 Try in Sandbox
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '15px', overflowX: 'auto' }}>
                    <code style={{ fontSize: '13px', color: '#00d2ff', display: 'block', whiteSpace: 'pre', textAlign: 'left' }}>
                      {sec.code}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Dynamic Tabs (Visualizer & Coding Area) */}
      <div className="learn-content">
        <div className="module-tabs">
          <div 
            className={`module-tab ${activeSubTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('theory')}
          >
            Module Theory Summary
          </div>
          <div 
            className={`module-tab ${activeSubTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('simulator')}
          >
            Visual Simulator
          </div>
          <div 
            className={`module-tab ${activeSubTab === 'practice' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('practice')}
          >
            Coding IDE Challenge
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: activeSubTab === 'practice' ? 'hidden' : 'auto', 
          padding: activeSubTab === 'practice' ? '0' : '30px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeSubTab === 'theory' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>Day Summary Overview</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Read the left sidebar details. When ready, switch to the <strong>Visual Simulator</strong> tab to interact with the core concepts, then complete the <strong>Coding IDE Challenge</strong> to unlock achievements.
              </p>
              
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--neon-blue)', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>🎓 Key learning check:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  <li>Interactive visualization gives you deep memory structure insights.</li>
                  <li>Coding exercise requires exact matching outputs based on notes.</li>
                  <li>Unlock badge certificates showing your mastery!</li>
                </ul>
              </div>
            </div>
          )}

          {activeSubTab === 'simulator' && getSimulatorComponent()}

          {activeSubTab === 'practice' && (
            <div 
              ref={containerRef}
              className="ide-container"
              style={{
                userSelect: isDragging ? 'none' : 'auto',
                cursor: isDragging ? 'row-resize' : 'auto'
              }}
            >
              {/* Instructions top pane */}
              <div 
                ref={instructionsRef}
                style={{ background: '#0e0e11', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: '6px', textTransform: 'uppercase' }}>
                  💻 Coding Challenge
                </h4>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                  {lesson.exercise.desc}
                </p>
              </div>

              {/* Textarea editor area */}
              <div className="ide-editor-area" style={{ height: `${editorHeight}px`, flexShrink: 0 }}>
                {ideAlert && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--neon-blue)', color: '#000', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', zIndex: 100, boxShadow: '0 0 10px var(--neon-blue-glow)' }}>
                    {ideAlert}
                  </div>
                )}
                <textarea
                  className="ide-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Write your code here..."
                  spellCheck="false"
                />
              </div>

              {/* Draggable Divider */}
              <div 
                onMouseDown={handleMouseDown}
                className="ide-divider"
                style={{
                  height: '8px',
                  background: isDragging ? 'var(--neon-blue)' : '#16161a',
                  cursor: 'row-resize',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  transition: 'background 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isDragging ? '0 0 10px var(--neon-blue-glow)' : 'none',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '2px',
                  background: isDragging ? '#fff' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '1px',
                  transition: 'background 0.15s ease'
                }} />
              </div>

              {/* Console log / AI Tutor window */}
              <div className="ide-console" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100px' }}>
                {/* Console tabs headers */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#060608' }}>
                  <button
                    onClick={() => setConsoleTab('console')}
                    style={{
                      background: 'transparent',
                      color: consoleTab === 'console' ? 'var(--neon-blue)' : '#555',
                      border: 'none',
                      borderBottom: consoleTab === 'console' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                      padding: '10px 20px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📟 Execution Output
                  </button>
                  <button
                    onClick={() => setConsoleTab('ai')}
                    style={{
                      background: 'transparent',
                      color: consoleTab === 'ai' ? 'var(--neon-blue)' : '#555',
                      border: 'none',
                      borderBottom: consoleTab === 'ai' ? '2px solid var(--neon-blue)' : '2px solid transparent',
                      padding: '10px 20px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🤖 AI Tutor Feedback
                  </button>
                </div>

                {/* Console tab body panels */}
                <div style={{ flex: 1, padding: '15px 20px', overflowY: 'auto' }}>
                  {consoleTab === 'console' ? (
                    <div>
                      {consoleLogs.map((log, idx) => {
                        let cls = "console-log-line";
                        if (log.startsWith('[COMPILER ERROR]')) cls += " error";
                        else if (log.startsWith('[ERROR]')) cls += " error";
                        return (
                          <div key={idx} className={cls}>
                            &gt; {log}
                          </div>
                        );
                      })}
                      {exerciseStatus === 'success' && (
                        <div className="console-log-line success" style={{ fontWeight: 'bold' }}>
                          🎉 CHALLENGE PASSED! +100 XP awarded. Check your dashboard for badge certificates!
                        </div>
                      )}
                      {exerciseStatus === 'fail' && (
                        <div className="console-log-line error" style={{ fontWeight: 'bold' }}>
                          ❌ CHALLENGE FAILED. Check console outputs above and try again.
                        </div>
                      )}
                      {consoleLogs.length === 0 && exerciseStatus === 'idle' && (
                        <div style={{ color: '#444' }}>[Console empty. Click 'Run Code' to execute]</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {aiLoading && (
                        <div style={{ color: 'var(--neon-blue)', fontFamily: 'monospace', animation: 'pulse 1.5s infinite' }}>
                          ⚡ Analyzing workspace code... Asking Gemini AI for tutor feedback...
                        </div>
                      )}
                      {aiError && (
                        <div style={{ color: 'var(--neon-red)', fontFamily: 'monospace' }}>
                          ❌ Error requesting AI feedback: {aiError}
                        </div>
                      )}
                      {aiFeedback && (
                        <div 
                          style={{ 
                            color: '#e4e4e7', 
                            fontSize: '14px', 
                            lineHeight: '1.5', 
                            whiteSpace: 'pre-wrap', 
                            fontFamily: 'monospace',
                            textAlign: 'left'
                          }}
                        >
                          {aiFeedback}
                        </div>
                      )}
                      {!aiLoading && !aiFeedback && !aiError && (
                        <div style={{ color: '#444', fontFamily: 'monospace' }}>
                          [Click '🤖 Ask AI Tutor' below to get conceptual hints from Gemini]
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom compiler actions deck */}
              <div className="ide-actions">
                <div>
                  <button 
                    className="btn-neon" 
                    onClick={() => setShowHint(!showHint)}
                    style={{ padding: '6px 12px', fontSize: '12px', marginRight: '10px' }}
                  >
                    💡 Hint
                  </button>
                  {showHint && (
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {lesson.exercise.hint}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-neon"
                    onClick={askGemini}
                    disabled={!code}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px', 
                      color: 'var(--neon-blue)', 
                      borderColor: 'var(--neon-blue)',
                      opacity: !code ? 0.4 : 1
                    }}
                  >
                    🤖 Ask AI Tutor
                  </button>
                  <button 
                    className="btn-neon-blue" 
                    onClick={runCode}
                    style={{ padding: '8px 20px', fontSize: '14px' }}
                  >
                    ⚡ Run Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayModule;
