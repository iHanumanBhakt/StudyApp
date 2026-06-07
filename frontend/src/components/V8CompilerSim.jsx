import React, { useState } from 'react';

const V8CompilerSim = () => {
  const [activeTab, setActiveTab] = useState('compiler'); // 'compiler' or 'sandbox'
  const [inputCode, setInputCode] = useState('console.log("hello")');
  const [step, setStep] = useState(0);
  const [sandboxLang, setSandboxLang] = useState('cpp');

  // Compiler Steps DATA
  const getCompilerSteps = () => {
    const isMath = inputCode.includes('+') || inputCode.includes('-') || inputCode.includes('*') || inputCode.includes('/');
    let argContent = '"hello"';
    let outputVal = "hello";

    if (isMath) {
      // simple evaluation
      try {
        const mathExpr = inputCode.match(/log\(([^)]+)\)/)?.[1] || "2+3";
        argContent = mathExpr;
        outputVal = new Function(`return (${mathExpr})`)();
      } catch {
        argContent = "2+3";
        outputVal = "5";
      }
    } else {
      const strExpr = inputCode.match(/log\(([^)]+)\)/)?.[1] || '"hello"';
      argContent = strExpr;
      outputVal = strExpr.replace(/['"]/g, '');
    }

    return [
      {
        title: "1. Lexical Analysis (Tokenization)",
        desc: "The V8 engine scans the raw characters and groups them into meaningful tokens.",
        visual: [
          { token: "console", type: "Identifier" },
          { token: ".", type: "Punctuation" },
          { token: "log", type: "Identifier" },
          { token: "(", type: "Punctuation" },
          { token: argContent, type: isMath ? "MathExpression" : "StringLiteral" },
          { token: ")", type: "Punctuation" }
        ],
        explanation: "Before parsing, characters are grouped. 'console' is identified as an object identifier, '.' is a property access link, and 'log' is the property key."
      },
      {
        title: "2. Abstract Syntax Tree (AST) Parsing",
        desc: "Parser processes tokens into a hierarchical syntax tree.",
        visual: {
          node: "ExpressionStatement",
          child: {
            node: "CallExpression",
            callee: {
              node: "MemberExpression",
              object: "Identifier (console)",
              property: "Identifier (log)"
            },
            arguments: [
              { node: isMath ? "BinaryExpression" : "Literal", value: argContent }
            ]
          }
        },
        explanation: "An AST represents the structure of your code. It shows that we are calling a function (MemberExpression 'console.log') with specific arguments."
      },
      {
        title: "3. Bytecode Generation (Ignition)",
        desc: "V8's interpreter 'Ignition' translates the AST into a custom, optimized Bytecode register instructions.",
        bytecode: [
          "Ldar a0               ; Load accumulator with argument",
          `LdaConstant [0]       ; Load Constant [${argContent}]`,
          "Star r1               ; Store accumulator in register r1 (arguments array)",
          "GetNamedProperty r0, [1] ; Get 'log' property from 'console' object",
          "CallProperty1 r0, r0, r1 ; Invoke console.log with arguments stored in r1",
          "Return                ; Finish execution"
        ],
        explanation: "Rather than compiling directly to machine machine code (which takes too much RAM), V8 compiles it into lightweight Bytecode that Ignition runs quickly."
      },
      {
        title: "4. Machine Code & Console Output",
        desc: "The V8 compiler (TurboFan) converts hot code to native assembly, and executes it in a memory-safe sandbox.",
        output: outputVal.toString(),
        explanation: `Success! The binary machine code triggers the standard terminal stdout interface to write: "${outputVal}"`
      }
    ];
  };

  const compilerSteps = getCompilerSteps();

  const handleNextStep = () => {
    if (step < compilerSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={activeTab === 'compiler' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => { setActiveTab('compiler'); setStep(0); }}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          V8 Compiler Parser Visualizer
        </button>
        <button 
          className={activeTab === 'sandbox' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => setActiveTab('sandbox')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          C++ vs JS Sandbox Security Simulator
        </button>
      </div>

      {activeTab === 'compiler' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '15px' }}>V8 Parsing Simulator</h3>
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontFamily: 'monospace' }}>Select/Edit Code:</label>
            <select 
              value={inputCode} 
              onChange={(e) => { setInputCode(e.target.value); setStep(0); }}
              style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              <option value='console.log("hello")'>console.log("hello")</option>
              <option value='console.log(10 + 20)'>console.log(10 + 20)</option>
              <option value='console.log("Hackathon Win!")'>console.log("Hackathon Win!")</option>
            </select>
          </div>

          {/* Current Step visual card */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '8px', border: '1px solid #222', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '18px', color: '#fff', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                {compilerSteps[step].title}
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {compilerSteps[step].desc}
              </p>

              {/* Step 1 Visualizer */}
              {step === 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px 0' }}>
                  {compilerSteps[0].visual.map((tok, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#18181c', border: '1px solid #333', borderRadius: '6px', textAlign: 'center' }}>
                      <code style={{ fontSize: '16px', color: 'var(--neon-blue)' }}>{tok.token}</code>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', textTransform: 'uppercase' }}>{tok.type}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2 Visualizer: AST */}
              {step === 1 && (
                <div style={{ fontFamily: 'monospace', fontSize: '13px', background: '#111', padding: '15px', borderRadius: '6px', borderLeft: '3px solid var(--neon-blue)', color: '#a0a0a5' }}>
                  <div>➔ AST Root Node: <strong style={{ color: '#fff' }}>{compilerSteps[1].visual.node}</strong></div>
                  <div style={{ paddingLeft: '20px' }}>└─ Callee: <strong style={{ color: '#fff' }}>{compilerSteps[1].visual.child.node}</strong></div>
                  <div style={{ paddingLeft: '40px' }}>├── Object: <span style={{ color: 'var(--neon-blue)' }}>{compilerSteps[1].visual.child.callee.object}</span></div>
                  <div style={{ paddingLeft: '40px' }}>└── Property: <span style={{ color: 'var(--neon-blue)' }}>{compilerSteps[1].visual.child.callee.property}</span></div>
                  <div style={{ paddingLeft: '20px' }}>└─ Arguments:</div>
                  <div style={{ paddingLeft: '40px' }}>└── <span style={{ color: '#fff' }}>{compilerSteps[1].visual.child.arguments[0].node}</span> (value: <span style={{ color: 'var(--neon-green)' }}>{compilerSteps[1].visual.child.arguments[0].value}</span>)</div>
                </div>
              )}

              {/* Step 3 Visualizer: Bytecode */}
              {step === 2 && (
                <div style={{ background: '#09090b', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
                  {compilerSteps[2].bytecode.map((line, idx) => (
                    <div key={idx} style={{ fontFamily: 'monospace', color: '#888', margin: '4px 0', fontSize: '14px' }}>
                      <span style={{ color: '#444', marginRight: '15px' }}>0x{idx.toString(16).padStart(2, '0')}</span>
                      <span style={{ color: line.includes(';') ? '#fff' : 'var(--neon-blue)' }}>
                        {line.split(';')[0]}
                      </span>
                      {line.includes(';') && (
                        <span style={{ color: '#555', fontStyle: 'italic' }}>
                          ; {line.split(';')[1]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4 Visualizer: Console */}
              {step === 3 && (
                <div>
                  <div style={{ background: '#000', border: '2px solid #333', padding: '15px', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--neon-green)', textShadow: '0 0 5px var(--neon-green-glow)' }}>
                    <div style={{ fontSize: '12px', color: '#444', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px' }}>SYSTEM TERMINAL OUTPUT</div>
                    &gt; {compilerSteps[3].output}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '15px', fontSize: '13px', color: '#777', lineHeight: '1.4' }}>
              💡 {compilerSteps[step].explanation}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button className="btn-neon" onClick={handlePrevStep} disabled={step === 0} style={{ padding: '8px 18px', fontSize: '13px', opacity: step === 0 ? 0.3 : 1 }}>
              Back
            </button>
            <div style={{ alignSelf: 'center', fontSize: '14px', fontFamily: 'monospace' }}>
              Step {step + 1} of {compilerSteps.length}
            </div>
            <button className="btn-neon-blue" onClick={handleNextStep} disabled={step === compilerSteps.length - 1} style={{ padding: '8px 18px', fontSize: '13px', opacity: step === compilerSteps.length - 1 ? 0.3 : 1 }}>
              Next Step
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ border: '1px solid rgba(255,0,85,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-red)', marginBottom: '15px' }}>Browser Sandbox Security Sandbox</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={sandboxLang === 'cpp' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => setSandboxLang('cpp')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Run Raw C++ Code
            </button>
            <button 
              className={sandboxLang === 'js' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => setSandboxLang('js')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Run Sandboxed JavaScript Code
            </button>
          </div>

          {sandboxLang === 'cpp' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#09090b', padding: '15px', borderRadius: '6px', border: '1px solid #222', fontFamily: 'monospace', fontSize: '14px' }}>
                <span style={{ color: 'var(--neon-red)' }}>#include</span> &lt;fstream&gt;<br />
                <span style={{ color: 'var(--neon-red)' }}>#include</span> &lt;cstdlib&gt;<br />
                <span style={{ color: '#00d2ff' }}>int</span> <span style={{ color: '#fff' }}>main</span>() &#123;<br />
                &nbsp;&nbsp;<span style={{ color: '#555' }}>// Attempt to write straight to system disk</span><br />
                &nbsp;&nbsp;std::ofstream file(<span style={{ color: 'var(--neon-green)' }}>"C:\\Windows\\System32\\secrets.txt"</span>);<br />
                &nbsp;&nbsp;file &lt;&lt; <span style={{ color: 'var(--neon-green)' }}>"stolen user session data"</span>;<br />
                &nbsp;&nbsp;<br />
                &nbsp;&nbsp;<span style={{ color: '#555' }}>// Attempt to call host operating system commands</span><br />
                &nbsp;&nbsp;system(<span style={{ color: 'var(--neon-green)' }}>"rm -rf /"</span>); <span style={{ color: '#555' }}>// Wipes files on Linux</span><br />
                &nbsp;&nbsp;<span style={{ color: 'var(--neon-red)' }}>return</span> <span style={{ color: '#fff' }}>0</span>;<br />
                &#125;
              </div>
              <div style={{ background: 'rgba(255, 0, 85, 0.1)', border: '1px solid var(--neon-red)', padding: '15px', borderRadius: '6px', color: '#ffb3c1', fontSize: '14px' }}>
                <strong style={{ color: 'var(--neon-red)' }}>⚠️ HEAVY EXPLOIT BLOCKED!</strong>
                <p style={{ marginTop: '6px', lineHeight: '1.4' }}>
                  If a browser ran compiled C++ directly, this script would access your computer's storage, steal browser cookies, or run system calls like `system()`. Because C++ does not have a native safety sandbox and compiles directly to machine code, running raw C++ from websites would make the internet a security disaster.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#09090b', padding: '15px', borderRadius: '6px', border: '1px solid #222', fontFamily: 'monospace', fontSize: '14px' }}>
                <span style={{ color: '#00d2ff' }}>const</span> fs = require(<span style={{ color: 'var(--neon-green)' }}>'fs'</span>);<br />
                fs.writeFileSync(<span style={{ color: 'var(--neon-green)' }}>'/secrets.txt'</span>, <span style={{ color: 'var(--neon-green)' }}>'data'</span>);
              </div>
              <div style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid var(--neon-green)', padding: '15px', borderRadius: '6px', color: '#c2ffc7', fontSize: '14px' }}>
                <strong style={{ color: 'var(--neon-green)' }}>🛡️ SANDBOX SAFE EXCEPTION THROWN!</strong>
                <div style={{ background: '#000', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--neon-red)', margin: '10px 0', fontSize: '13px' }}>
                  ReferenceError: require is not defined<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;at &lt;anonymous&gt;:1:14
                </div>
                <p style={{ lineHeight: '1.4' }}>
                  JavaScript engines run inside a **sandboxed runtime environment**. The browser denies direct API bindings like `require` or filesystem writes. Even if a script tries to execute malicious code, it cannot escape the secure container of your browser tab.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default V8CompilerSim;
