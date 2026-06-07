import React, { useState } from 'react';

const QUIZ_QUESTIONS = {
  1: [
    {
      q: "Why did Netscape decide to invent a second language (JavaScript) when Java was already going into the browser?",
      options: [
        "Java was owned by Microsoft and they feared licensing costs.",
        "Java was too heavyweight for simple page 'glue' tasks and sat inside a sealed box (applet) that couldn't easily touch the page itself.",
        "JavaScript was faster than Java for heavy game development.",
        "Netscape lost the source code of the Java compiler."
      ],
      answer: 1,
      explanation: "Java sat inside a sealed container (applet) and was too complex for web designers. JavaScript was designed as a lightweight 'glue language' woven directly into the page document to handle clicks, forms, and simple animations."
    },
    {
      q: "What is a major security hazard of putting raw C++ in the browser?",
      options: [
        "It would make the browser too slow to load text files.",
        "It lacks memory sandboxing, allowing website code to access raw hardware addresses, read/write hard disk files, and run OS commands.",
        "It requires a special license from Netscape.",
        "It does not support HTML tags."
      ],
      answer: 1,
      explanation: "Raw C++ has no native sandboxing. A malicious website could run system calls (like formatting a drive) or use pointer arithmetic to peek into kernel memory, making it a massive security nightmare."
    },
    {
      q: "How many days did Brendan Eich take to build the prototype of JavaScript in May 1995?",
      options: ["10 Days", "100 Days", "3 Years", "1 Day"],
      answer: 0,
      explanation: "Brendan Eich built the prototype of JavaScript in roughly ten days under orders to make it Java's 'silly little brother' for marketing purposes."
    },
    {
      q: "Which of the following is true about the name 'JavaScript'?",
      options: [
        "It was named because JavaScript is compiled using Java libraries.",
        "It was pure marketing to ride on Java's popularity at the time; the two languages are largely unrelated.",
        "It was invented by Sun Microsystems.",
        "JavaScript is a subset of Java."
      ],
      answer: 1,
      explanation: "The name was a marketing decision. As the old developer joke goes: 'Java and JavaScript are as related as Car and Carpet'."
    },
    {
      q: "What was the typical consumer computer RAM size in 1995?",
      options: ["4 MB to 8 MB", "16 GB", "512 MB", "256 KB"],
      answer: 0,
      explanation: "Typical consumer PCs in 1995 ran on 4 MB to 8 MB of RAM, meaning browser runtimes had to stay extremely lightweight to avoid system crashes."
    }
  ],
  2: [
    {
      q: "What is the output of 'typeof null' in JavaScript, and what is its historical reason?",
      options: [
        "It returns 'null' because it is a primitive data type.",
        "It returns 'object' because of a 30-year-old tag bug in the original engine where the type tag for objects matched null (all 0s).",
        "It returns 'undefined' because null has no value.",
        "It throws a TypeError."
      ],
      answer: 1,
      explanation: "This is a famous, long-standing bug. In the original JS implementation, values were stored with type tags. Null was represented as all zeros, and since objects had the type tag 000, null was misidentified as an object."
    },
    {
      q: "What is the 'Temporal Dead Zone' (TDZ) in JavaScript?",
      options: [
        "The time it takes for a page to load before JavaScript boots.",
        "The state between a block scope starting and a let/const variable declaration line, during which accessing it throws a ReferenceError.",
        "The period of time when garbage collector frees memory.",
        "The scope where 'var' variables leak into other functions."
      ],
      answer: 1,
      explanation: "Variables declared with let and const are hoisted to the top of their block but are not initialized. They reside in the TDZ from the start of the block until their declaration is parsed."
    },
    {
      q: "What happens when you declare an object using 'const' and modify its inner properties?",
      options: [
        "It throws a TypeError because const variables are immutable.",
        "It is allowed; const only ensures the reference pointer in the stack is immutable, not the object values in the heap.",
        "It changes the object to a string primitive.",
        "It deletes the object from memory."
      ],
      answer: 1,
      explanation: "Const guarantees that the variable's reference pointer remains immutable (you cannot reassign the variable to a new object), but the underlying heap object properties remain fully mutable."
    },
    {
      q: "Which of the following contains ONLY primitive data types?",
      options: [
        "number, string, boolean, object, undefined",
        "number, string, boolean, bigint, symbol, null, undefined",
        "array, object, function, Date",
        "string, number, symbol, Map, Set"
      ],
      answer: 1,
      explanation: "JavaScript has exactly 7 primitive data types: number, string, boolean, bigint, symbol, null, and undefined. Objects, arrays, and functions are non-primitives."
    },
    {
      q: "What is the key difference between Primitives and Objects in how they are assigned to variables?",
      options: [
        "Primitives are stored in the Heap; Objects are stored in the Stack.",
        "Primitives are assigned by value (copied); Objects are assigned by reference pointer (address is shared).",
        "Primitives can only be strings; Objects can be anything.",
        "There is no difference; both are passed by address."
      ],
      answer: 1,
      explanation: "Primitives store values directly in the stack and are copied by value. Objects are stored in the heap, and their variables store memory addresses, meaning copies link to the same heap cell."
    }
  ],
  3: [
    {
      q: "Why does '0.1 + 0.2 === 0.3' evaluate to false in JavaScript?",
      options: [
        "JavaScript uses base-10 math internally which doesn't support decimals.",
        "Numbers are stored in IEEE-754 double-precision binary floats, which cannot represent certain decimals perfectly, causing tiny rounding errors that accumulate.",
        "The strict equality operator (===) performs automatic type conversion.",
        "JavaScript engines restrict math computations in the browser sandbox."
      ],
      answer: 1,
      explanation: "Since fractions like 0.1 and 0.2 repeat infinitely in binary, V8 rounds and truncates them, resulting in 0.1 + 0.2 evaluating to 0.30000000000000004."
    },
    {
      q: "What is the result of the comparison '[] == false' in JavaScript, and why?",
      options: [
        "false, because an array is an object and objects are always truthy.",
        "true, because loose equality coerces false to 0, [] to an empty string '', and '' to number 0.",
        "false, because types are checked first and they are different.",
        "It throws a SyntaxError."
      ],
      answer: 1,
      explanation: "In loose equality, the boolean false is converted to number 0. The object [] is converted to primitive empty string '', which then gets parsed to number 0. Since 0 == 0, it returns true."
    },
    {
      q: "Which function is best to extract the number '100' from the string '100px'?",
      options: ["Number('100px')", "parseInt('100px')", "Boolean('100px')", "+'100px'"],
      answer: 1,
      explanation: "parseInt() reads strings left-to-right and extracts numbers until it hits a non-numeric character (like 'p'). Number() and unary '+' would return NaN since the entire string is not numeric."
    },
    {
      q: "Which of the following is NOT a 'falsy' value in JavaScript?",
      options: ["0", "NaN", "[] (empty array)", "'' (empty string)"],
      answer: 2,
      explanation: "JavaScript has exactly 6 falsy values: false, 0, '', null, undefined, and NaN. Objects and arrays (even empty ones) are always truthy."
    },
    {
      q: "What is the result of the comparison 'null == undefined'?",
      options: [
        "false, because they are different types.",
        "true, because in loose equality null is loosely equal to undefined and nothing else.",
        "It throws a NullPointerException.",
        "true, because both convert to number 0."
      ],
      answer: 1,
      explanation: "By JavaScript specification, null is loosely equal to undefined (null == undefined is true) and is not equal to any other value."
    }
  ],
  4: [
    {
      q: "Which loop guarantees that the code block inside will execute at least once?",
      options: ["for loop", "while loop", "do...while loop", "for...in loop"],
      answer: 2,
      explanation: "The do...while loop executes the code block first, then checks the condition at the end. Thus, it is guaranteed to run at least one time."
    },
    {
      q: "In the formula 'Math.floor(Math.random() * (max - min + 1)) + min', why do we add '+ min' at the end?",
      options: [
        "To get rid of decimal points.",
        "To shift the starting point of our generated integer range to our desired minimum value.",
        "To scale up the output range.",
        "To check if the number is even or odd."
      ],
      answer: 1,
      explanation: "Multiplying Math.random() by the range size generates values starting at 0. Adding 'min' shifts the range upwards to start at the min value."
    },
    {
      q: "What is the output of: let str = 'alex'; str[0] = 'A'; console.log(str);",
      options: ["'Alex'", "'alex'", "'A'", "Throws a TypeError"],
      answer: 1,
      explanation: "Strings are primitive types and thus immutable. Attempting to assign a new character directly via index fails silently in non-strict mode, leaving the string unchanged."
    },
    {
      q: "What is the output of 'console.log(\"JavaScript\".slice(0, 4))'?",
      options: ["'Java'", "'Jav'", "'Script'", "'JavaScript'"],
      answer: 0,
      explanation: "The slice(start, end) method extracts characters from the start index up to, but NOT including, the end index. So slice(0, 4) gets indices 0, 1, 2, and 3, which is 'Java'."
    },
    {
      q: "What is the danger of forgetting to update the loop condition variable inside a 'while' loop?",
      options: [
        "It converts variables to strings.",
        "It creates an infinite loop, freezing the browser thread and crashing the tab.",
        "It deletes files from the backend database.",
        "It executes the code block exactly once."
      ],
      answer: 1,
      explanation: "If the condition variable never updates, the loop condition remains true forever, putting the browser thread in an infinite cycle which freezes the page UI."
    }
  ]
};

const QuizArena = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = QUIZ_QUESTIONS[selectedDay];
  const currentQuestion = questions[currentQuestionIdx];

  const handleOptionClick = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = (dayNum = selectedDay) => {
    setSelectedDay(dayNum);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', width: '100%', padding: '0 20px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>⚡ Quiz Arena</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
          Test your conceptual understanding of JavaScript from Day 1 to Day 4. Get immediate feedback on code execution quirks!
        </p>

        {/* Day selection tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
          {[1, 2, 3, 4].map(dayNum => (
            <button
              key={dayNum}
              className={selectedDay === dayNum ? 'btn-neon-blue' : 'btn-neon'}
              onClick={() => restartQuiz(dayNum)}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Day 0{dayNum} Quiz
            </button>
          ))}
        </div>

        {!quizFinished ? (
          <div>
            {/* Question count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px', fontFamily: 'monospace' }}>
              <span>Day {selectedDay} Quiz</span>
              <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            </div>

            {/* Question title */}
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '24px', lineHeight: '1.4' }}>
              {currentQuestion.q}
            </h3>

            {/* Options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {currentQuestion.options.map((option, idx) => {
                let borderStyle = '1px solid rgba(255,255,255,0.08)';
                let backgroundStyle = 'rgba(255,255,255,0.02)';
                let colorStyle = '#fff';

                if (isAnswered) {
                  if (idx === currentQuestion.answer) {
                    borderStyle = '1px solid var(--neon-green)';
                    backgroundStyle = 'rgba(57, 255, 20, 0.08)';
                    colorStyle = 'var(--neon-green)';
                  } else if (idx === selectedOption) {
                    borderStyle = '1px solid var(--neon-red)';
                    backgroundStyle = 'rgba(255, 0, 85, 0.08)';
                    colorStyle = 'var(--neon-red)';
                  } else {
                    borderStyle = '1px solid rgba(255,255,255,0.02)';
                    backgroundStyle = 'transparent';
                    colorStyle = '#555';
                  }
                } else {
                  // hover state styling via active clicks
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    style={{
                      border: borderStyle,
                      background: backgroundStyle,
                      color: colorStyle,
                      padding: '16px 20px',
                      borderRadius: '8px',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '16px',
                      lineHeight: '1.4'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswered && (
              <div 
                style={{ 
                  background: 'rgba(0, 210, 255, 0.04)', 
                  border: '1px solid rgba(0, 210, 255, 0.2)', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#e4e4e7'
                }}
              >
                <strong style={{ color: 'var(--neon-blue)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                  💡 Concept Explanation:
                </strong>
                {currentQuestion.explanation}
              </div>
            )}

            {/* Action deck */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-neon-blue"
                onClick={handleNext}
                disabled={!isAnswered}
                style={{ opacity: isAnswered ? 1 : 0.3, padding: '10px 24px', fontSize: '14px' }}
              >
                {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: '64px' }}>🏆</span>
            <h3 style={{ fontSize: '28px', margin: '20px 0 10px 0' }}>Quiz Complete!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
              You scored <strong style={{ color: 'var(--neon-green)' }}>{score}</strong> out of <strong style={{ color: '#fff' }}>{questions.length}</strong> on the Day {selectedDay} Quiz.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn-neon-blue" onClick={() => restartQuiz()}>
                Try Again
              </button>
              <button 
                className="btn-neon" 
                onClick={() => {
                  const nextDay = selectedDay < 4 ? selectedDay + 1 : 1;
                  restartQuiz(nextDay);
                }}
              >
                Next Day Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArena;
