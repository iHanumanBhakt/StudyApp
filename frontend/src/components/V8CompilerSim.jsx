import React, { useState, useEffect } from 'react';

const V8CompilerSim = () => {
  const [activeTab, setActiveTab] = useState('compiler'); // 'compiler' or 'sandbox'
  const [inputCode, setInputCode] = useState('console.log("hello")');
  const [step, setStep] = useState(0);
  const [sandboxLang, setSandboxLang] = useState('cpp');
  const [lexerScanProgress, setLexerScanProgress] = useState(0);
  const [cppExploited, setCppExploited] = useState(false);

  // Restart lexer scan animation when step 0 is selected
  useEffect(() => {
    if (step === 0 && activeTab === 'compiler') {
      setLexerScanProgress(0);
      const interval = setInterval(() => {
        setLexerScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, activeTab, inputCode]);

  // Compiler Steps DATA
  const getCompilerSteps = () => {
    const isMath = inputCode.includes('+') || inputCode.includes('-') || inputCode.includes('*') || inputCode.includes('/');
    let argContent = '"hello"';
    let outputVal = "hello";

    if (isMath) {
      try {
        const mathExpr = inputCode.match(/log\(([^)]+)\)/)?.[1] || "10+20";
        argContent = mathExpr;
        outputVal = new Function(`return (${mathExpr})`)();
      } catch {
        argContent = "10+20";
        outputVal = "30";
      }
    } else {
      const strExpr = inputCode.match(/log\(([^)]+)\)/)?.[1] || '"hello"';
      argContent = strExpr;
      outputVal = strExpr.replace(/['"]/g, '');
    }

    return [
      {
        title: "1. Lexical Analysis (Tokenization)",
        desc: "The V8 engine scans the raw characters and groups them into structural tokens.",
        visual: [
          { token: "console", type: "Identifier", color: "var(--neon-green)" },
          { token: ".", type: "Punctuation", color: "orange" },
          { token: "log", type: "Identifier", color: "var(--neon-green)" },
          { token: "(", type: "Punctuation", color: "orange" },
          { token: argContent, type: isMath ? "MathExpression" : "StringLiteral", color: "var(--neon-blue)" },
          { token: ")", type: "Punctuation", color: "orange" }
        ],
        explanation: "V8 scans the source string from left to right. Characters are grouped into Lexical Tokens. 'console' is recognized as an object reference, '.' as a property accessor, and 'log' as the method name."
      },
      {
        title: "2. Abstract Syntax Tree (AST) Parsing",
        desc: "The parser processes tokens into a hierarchical, type-checked syntax tree.",
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
        explanation: "The parser arranges tokens into a nested tree configuration. The tree represents the grammar structure: a function call ('CallExpression') targeting the member 'console.log' with specific parameters."
      },
      {
        title: "3. Bytecode Generation (Ignition)",
        desc: "V8's virtual machine interpreter 'Ignition' compiles the AST into a customized register instruction bytecode.",
        bytecode: [
          { code: "Ldar a0", explanation: "Load accumulator with console instance reference" },
          { code: `LdaConstant [0]`, explanation: `Load Constant value '${argContent}' into accumulator` },
          { code: "Star r1", explanation: "Store accumulator in register r1 (arguments array)" },
          { code: "GetNamedProperty r0, [1]", explanation: "Fetch 'log' property from object 'console'" },
          { code: "CallProperty1 r0, r0, r1", explanation: "Call console.log passing 'r1' register parameter" },
          { code: "Return", explanation: "Exit function call and release stack frame" }
        ],
        registers: {
          Accumulator: argContent,
          r0: "console object",
          r1: argContent,
          ConstantPool: `[0]: ${argContent}, [1]: 'log'`
        },
        explanation: "Rather than compiling directly to machine machine code (which takes too much memory), V8 compiles it into lightweight Bytecode that Ignition's stack machine runs quickly."
      },
      {
        title: "4. Machine Code & Console Output",
        desc: "The V8 compiler (TurboFan) converts hot code to native assembly, and executes it in a memory-safe sandbox.",
        output: outputVal.toString(),
        assembly: [
          "mov rdi, [console_ref]  ; Load console descriptor",
          `mov rsi, [const_pool+0] ; Load '${argContent}' value`,
          "call [console_log_api] ; Execute system stdout terminal write"
        ],
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
          className={`sim-tab-btn ${activeTab === 'compiler' ? 'active' : ''}`}
          onClick={() => { setActiveTab('compiler'); setStep(0); }}
        >
          ⚙️ V8 Compiler Parser Visualizer
        </button>
        <button 
          className={`sim-tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sandbox'); setCppExploited(false); }}
        >
          🛡️ C++ vs JS Sandbox Security Simulator
        </button>
      </div>

      <style>{`
        .sim-tab-btn {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 20px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .sim-tab-btn:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.02);
        }
        .sim-tab-btn.active {
          color: var(--neon-blue);
          border-color: var(--neon-blue);
          background: rgba(0, 210, 255, 0.05);
          box-shadow: 0 0 10px rgba(0, 210, 255, 0.15);
        }
        .scanner-head {

          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--neon-blue);
          box-shadow: 0 0 10px var(--neon-blue-glow);
          transition: left 0.1s ease;
        }
        .ast-node {
          background: rgba(12, 12, 14, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 8px 12px;
          display: inline-block;
          font-family: monospace;
          transition: all 0.3s ease;
        }
        .ast-node:hover {
          border-color: var(--neon-blue);
          box-shadow: 0 0 10px var(--neon-blue-dim);
        }
        .vm-register-box {
          background: #070709;
          border: 1px solid #222;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        .vm-register-box span {
          color: #666;
          font-size: 10px;
          display: block;
          text-transform: uppercase;
        }
        .vm-register-box strong {
          color: var(--neon-green);
        }
        .binary-stream {
          font-family: monospace;
          font-size: 11px;
          color: rgba(57, 255, 20, 0.25);
          overflow: hidden;
          white-space: nowrap;
          height: 20px;
          position: relative;
        }
        .binary-stream::after {
          content: "01001000 01100101 01101100 01101100 01101111 00100000 01010110 00111000 01000011 01001111 01001101 01010000 01001001 01001100 01010101 01010011";
          position: absolute;
          animation: binary-slide 10s linear infinite;
        }
        @keyframes binary-slide {
          from { left: 100%; }
          to { left: -100%; }
        }
        .security-shield {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 3px solid var(--neon-green);
          box-shadow: 0 0 20px var(--neon-green-glow);
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(57, 255, 20, 0.05);
          position: relative;
        }
        .security-shield.exploited {
          border-color: var(--neon-red);
          box-shadow: 0 0 20px var(--neon-red-glow);
          background: rgba(255, 0, 85, 0.05);
        }
        .shield-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid var(--neon-green);
          animation: shield-wave 2s infinite;
        }
        .security-shield.exploited .shield-pulse {
          border-color: var(--neon-red);
        }
        @keyframes shield-wave {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* Compiler Mode Tab Select */}
      {activeTab === 'compiler' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--neon-blue)', margin: 0 }}>V8 Parsing Simulator</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Understand how the browser converts human-readable JavaScript code into machine-executable binaries.
            </p>
          </div>

          {/* Code selection dropdown */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontFamily: 'monospace', color: '#888' }}>SELECT JS EXPRESSION:</label>
            <select 
              value={inputCode} 
              onChange={(e) => { setInputCode(e.target.value); setStep(0); }}
              style={{ background: '#0a0a0d', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}
            >
              <option value='console.log("hello")'>console.log("hello")</option>
              <option value='console.log(10 + 20)'>console.log(10 + 20)</option>
              <option value='console.log("Hackathon Win!")'>console.log("Hackathon Win!")</option>
            </select>
          </div>

          {/* MAIN SIMULATOR BOARD */}
          <div style={{ background: '#040406', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Title Header of current stage */}
            <div>
              <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: '8px', borderBottom: '1px solid #111', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {compilerSteps[step].title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
                {compilerSteps[step].desc}
              </p>

              {/* STAGE 1: LEXER TOKENIZATION SCANNERS */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', padding: '10px 0' }}>
                  {/* Code feed string */}
                  <div style={{ position: 'relative', background: '#09090b', padding: '16px 20px', borderRadius: '6px', border: '1px solid #222', fontFamily: 'monospace', fontSize: '20px', color: '#fff', letterSpacing: '2px', overflow: 'hidden' }}>
                    {inputCode}
                    {/* Scanner vertical line */}
                    <div className="scanner-head" style={{ left: `${lexerScanProgress}%` }}></div>
                  </div>

                  {/* Generated Tokens container */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', minHeight: '60px' }}>
                    {compilerSteps[0].visual.map((tok, idx) => {
                      // Only display if the scanner progress has reached this percentage
                      const threshold = (idx / compilerSteps[0].visual.length) * 100;
                      const revealed = lexerScanProgress > threshold;
                      
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            padding: '10px 14px', 
                            background: '#0e0e12', 
                            border: `1px solid ${revealed ? tok.color : '#161616'}`, 
                            borderRadius: '6px', 
                            textAlign: 'center',
                            opacity: revealed ? 1 : 0.15,
                            transform: revealed ? 'scale(1)' : 'scale(0.95)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            minWidth: '80px'
                          }}
                        >
                          <code style={{ fontSize: '15px', color: revealed ? tok.color : '#444', fontWeight: 'bold' }}>{tok.token}</code>
                          <div style={{ fontSize: '9px', color: '#555', marginTop: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>{tok.type}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STAGE 2: AST GRAPHICAL TREE STRUCTURE */}
              {step === 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '480px' }}>
                    
                    {/* ExpressionStatement Node */}
                    <div className="ast-node" style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}>
                      <strong>Program (AST Root)</strong>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>ExpressionStatement</div>
                    </div>

                    <div style={{ height: '15px', width: '1px', borderLeft: '2px dashed #333' }}></div>

                    {/* CallExpression Node */}
                    <div className="ast-node" style={{ borderColor: 'var(--neon-blue)', color: 'var(--neon-blue)' }}>
                      <strong>CallExpression</strong>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Type: Function Call</div>
                    </div>

                    {/* MemberExpression & Literals Split */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', position: 'relative' }}>
                      {/* Visual SVG connectors */}
                      <svg style={{ position: 'absolute', top: '-20px', left: 0, width: '100%', height: '20px', pointerEvents: 'none' }}>
                        <line x1="25%" y1="0" x2="25%" y2="20" stroke="#333" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="75%" y1="0" x2="75%" y2="20" stroke="#333" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="25%" y1="0" x2="75%" y2="0" stroke="#333" strokeWidth="2" strokeDasharray="3,3" />
                      </svg>

                      {/* Left: Callee Member Expression */}
                      <div style={{ width: '48%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="ast-node" style={{ borderColor: '#bd00ff', color: '#bd00ff', width: '100%' }}>
                          <strong>MemberExpression</strong>
                          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>callee (console.log)</div>
                          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '11px', borderTop: '1px solid #222', paddingTop: '6px' }}>
                            <span style={{ color: '#aaa' }}>obj: console</span>
                            <span style={{ color: '#aaa' }}>prop: log</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Arguments node */}
                      <div style={{ width: '48%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="ast-node" style={{ borderColor: 'orange', color: 'orange', width: '100%' }}>
                          <strong>{compilerSteps[1].visual.child.arguments[0].node}</strong>
                          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Argument [0]</div>
                          <div style={{ fontSize: '13px', color: '#fff', marginTop: '8px', background: '#000', padding: '4px', borderRadius: '4px' }}>
                            {compilerSteps[1].visual.child.arguments[0].value}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* STAGE 3: INTERACTIVE VM IGNITION REGISTERS */}
              {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '10px 0' }}>
                  {/* Left: Bytecode assembly stream */}
                  <div style={{ background: '#070709', padding: '15px', borderRadius: '6px', border: '1px solid #1a1a24', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#444', borderBottom: '1px solid #111', paddingBottom: '4px', fontWeight: 'bold' }}>BYTECODE OPERANDS</div>
                    {compilerSteps[2].bytecode.map((line, idx) => (
                      <div key={idx} style={{ fontFamily: 'monospace', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          <span style={{ color: '#444', marginRight: '8px' }}>{idx}</span>
                          <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{line.code}</span>
                        </span>
                        <span style={{ color: '#555', fontSize: '11px', fontStyle: 'italic' }}>// {line.explanation}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: VM Physical registers HUD */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#bd00ff', fontWeight: 'bold' }}>V8 IGNITION REGISTERS HUD</div>
                    
                    <div className="vm-register-box">
                      <span>Accumulator Register (acc)</span>
                      <strong>{compilerSteps[2].registers.Accumulator}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div className="vm-register-box">
                        <span>Register r0</span>
                        <strong>{compilerSteps[2].registers.r0}</strong>
                      </div>
                      <div className="vm-register-box">
                        <span>Register r1</span>
                        <strong>{compilerSteps[2].registers.r1}</strong>
                      </div>
                    </div>

                    <div className="vm-register-box">
                      <span>Constant Pool Memory</span>
                      <strong style={{ color: '#bd00ff' }}>{compilerSteps[2].registers.ConstantPool}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4: MACHINE BINARY COMPILATION & TERMINAL MONITOR */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                  {/* Streaming binary ticker */}
                  <div style={{ background: '#070709', border: '1px solid #222', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: '#444', marginBottom: '2px', fontWeight: 'bold' }}>TURBOFAN BINARY OUTPUT STREAM</div>
                    <div className="binary-stream"></div>
                  </div>

                  {/* Assembly Code HUD vs Terminal Monitor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                    {/* Left: Native Assembly */}
                    <div style={{ background: '#09090c', padding: '15px', borderRadius: '6px', border: '1px solid #1a1a24', fontFamily: 'monospace', fontSize: '12px' }}>
                      <div style={{ fontSize: '10px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px' }}>ASSEMBLY REGISTERS (x86_64)</div>
                      {compilerSteps[3].assembly.map((line, idx) => (
                        <div key={idx} style={{ margin: '4px 0', color: '#aaa' }}>
                          <span style={{ color: '#555', marginRight: '6px' }}>{idx.toString().padStart(2, '0')}:</span>
                          <span style={{ color: line.startsWith('call') ? 'var(--neon-blue)' : '#fff' }}>{line.split(';')[0]}</span>
                          <span style={{ color: '#444', fontStyle: 'italic' }}>; {line.split(';')[1]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right: CRT Terminal stdout */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ background: '#000', border: '2px solid #333', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', color: 'var(--neon-green)', textShadow: '0 0 8px var(--neon-green-glow)', boxShadow: '0 0 20px rgba(57, 255, 20, 0.1) inset' }}>
                        <div style={{ fontSize: '10px', color: '#333', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '12px', fontWeight: 'bold' }}>CRT MONITOR TERMINAL</div>
                        <div style={{ fontSize: '20px', padding: '10px 0', textAlign: 'left' }}>
                          &gt; {compilerSteps[3].output}
                          <span style={{ animation: 'pulse 1s infinite', background: 'var(--neon-green)', width: '8px', height: '18px', display: 'inline-block', marginLeft: '5px', verticalAlign: 'middle' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Explanation card bottom */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'left' }}>
              <strong>💡 Section Takeaway:</strong> {compilerSteps[step].explanation}
            </div>

          </div>

          {/* Guided tour button navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button 
              className="btn-neon" 
              onClick={handlePrevStep} 
              disabled={step === 0} 
              style={{ padding: '8px 18px', fontSize: '13px', opacity: step === 0 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
            >
              ← Previous Step
            </button>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#666' }}>
              STEP {step + 1} OF {compilerSteps.length}
            </div>
            {step < compilerSteps.length - 1 ? (
              <button 
                className="btn-neon-blue" 
                onClick={handleNextStep} 
                style={{ padding: '8px 18px', fontSize: '13px', textTransform: 'none', letterSpacing: '0.5px' }}
              >
                Next Step →
              </button>
            ) : (
              <button 
                className="btn-neon-blue" 
                onClick={() => { setActiveTab('sandbox'); setStep(0); }} 
                style={{ padding: '8px 18px', fontSize: '13px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)', textTransform: 'none', letterSpacing: '0.5px' }}
              >
                🔒 Try Security Sandbox
              </button>
            )}
          </div>

        </div>
      ) : (
        /* SECTION 2: C++ VS JS SANDBOX SECURITY DASHBOARD */
        <div className="glass-card" style={{ border: '1px solid rgba(255,0,85,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--neon-red)', margin: 0 }}>Browser Security Dashboard</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Simulate the difference between running un-sandboxed C++ machine instructions and browser-sandboxed JavaScript engines.
            </p>
          </div>

          {/* Toggle buttons for Sandbox Language */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={sandboxLang === 'cpp' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setSandboxLang('cpp'); setCppExploited(false); }}
              style={{ padding: '8px 16px', fontSize: '12px', borderColor: sandboxLang === 'cpp' ? 'var(--neon-red)' : '#fff', color: sandboxLang === 'cpp' ? 'var(--neon-red)' : '#fff' }}
            >
              Compile & Run C++ Executable
            </button>
            <button 
              className={sandboxLang === 'js' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setSandboxLang('js'); setCppExploited(false); }}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              Execute JavaScript Sandbox VM
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Left: Code Box and action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sandboxLang === 'cpp' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#050508', padding: '15px', borderRadius: '6px', border: '1px solid rgba(255,0,85,0.15)', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--neon-red)' }}>#include</span> &lt;fstream&gt;<br />
                    <span style={{ color: 'var(--neon-red)' }}>#include</span> &lt;cstdlib&gt;<br />
                    <span style={{ color: '#bd00ff' }}>int</span> <span style={{ color: '#fff' }}>main</span>() &#123;<br />
                    &nbsp;&nbsp;<span style={{ color: '#555' }}>// Bypass sandbox and write directly to disk</span><br />
                    &nbsp;&nbsp;std::ofstream file(<span style={{ color: 'var(--neon-blue)' }}>"C:\\Windows\\System32\\secrets.txt"</span>);<br />
                    &nbsp;&nbsp;file &lt;&lt; <span style={{ color: 'var(--neon-blue)' }}>"compromised session logs"</span>;<br />
                    &nbsp;&nbsp;<br />
                    &nbsp;&nbsp;<span style={{ color: '#555' }}>// Execute native operating system binary wipes</span><br />
                    &nbsp;&nbsp;system(<span style={{ color: 'var(--neon-blue)' }}>"format D: /Q"</span>); <span style={{ color: '#555' }}>// Quick format drive</span><br />
                    &nbsp;&nbsp;<span style={{ color: 'var(--neon-red)' }}>return</span> <span style={{ color: '#fff' }}>0</span>;<br />
                    &#125;
                  </div>
                  <button 
                    className="btn-neon" 
                    onClick={() => setCppExploited(true)}
                    style={{ padding: '10px', fontSize: '13px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
                  >
                    🔥 RUN EXECUTABLE ON HOST COMPUTER
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#050508', padding: '15px', borderRadius: '6px', border: '1px solid rgba(57,255,20,0.15)', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--neon-blue)' }}>const</span> fs = require(<span style={{ color: 'var(--neon-green)' }}>'fs'</span>);<br />
                    fs.writeFileSync(<span style={{ color: 'var(--neon-green)' }}>'C:/Windows/System32/secrets.txt'</span>, <span style={{ color: 'var(--neon-green)' }}>'compromised'</span>);
                  </div>
                  <button 
                    className="btn-neon-blue" 
                    onClick={() => setCppExploited(true)}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    🛡️ EXECUTE IN CHROME V8 SANDBOX
                  </button>
                </div>
              )}
            </div>

            {/* Right: Graphic Simulation of sandbox vs breach */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #1a1a24', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              {!cppExploited ? (
                <div style={{ textSelf: 'center', color: '#444', fontSize: '13px', textAlign: 'center', fontFamily: 'monospace' }}>
                  [Click 'RUN' button to simulate operating system execution details]
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                  {sandboxLang === 'cpp' ? (
                    // C++ System breach graphics
                    <>
                      <div className="security-shield exploited">
                        <div className="shield-pulse"></div>
                        <span style={{ fontSize: '36px' }}>💥</span>
                      </div>
                      <div style={{ width: '100%', padding: '12px', background: 'rgba(255, 0, 85, 0.08)', border: '1px solid var(--neon-red)', borderRadius: '6px', color: '#ffb3c1', fontSize: '13px', lineHeight: '1.4', textAlign: 'left' }}>
                        <strong style={{ color: 'var(--neon-red)', display: 'block', marginBottom: '4px' }}>🚨 HOST MACHINE BREACHED!</strong>
                        C++ compiled binaries compile down to native x86 machine instructions. The executable bypasses browser limits, accessing disk drives directly, and executing hazardous command prompts (`system()`) on your PC.
                      </div>
                    </>
                  ) : (
                    // JS Sandbox deflection graphics
                    <>
                      <div className="security-shield">
                        <div className="shield-pulse"></div>
                        <span style={{ fontSize: '36px' }}>🛡️</span>
                      </div>
                      <div style={{ width: '100%', padding: '12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid var(--neon-green)', borderRadius: '6px', color: '#c2ffc7', fontSize: '13px', lineHeight: '1.4', textAlign: 'left' }}>
                        <strong style={{ color: 'var(--neon-green)', display: 'block', marginBottom: '4px' }}>🛡️ SHIELD DEFLECTED ATTACK!</strong>
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--neon-red)', background: '#000', padding: '4px 8px', borderRadius: '3px', margin: '5px 0' }}>
                          ReferenceError: require is not defined
                        </div>
                        JS executes inside an isolated virtual machine container. Operating system interfaces (like NodeJS `require` or filesystem drivers) are not registered in the browser window scope, preventing malicious code from escaping the browser tab.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V8CompilerSim;
