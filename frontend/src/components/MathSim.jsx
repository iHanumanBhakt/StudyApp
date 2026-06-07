import React, { useState, useEffect } from 'react';

const MathSim = () => {
  const [tab, setTab] = useState('random'); // 'random' or 'loop'
  const [minVal, setMinVal] = useState(1);
  const [maxVal, setMaxVal] = useState(10);
  const [randVal, setRandVal] = useState(0.5742);
  const [loopType, setLoopType] = useState('for');
  const [loopStep, setLoopStep] = useState(0);
  const [playerAttacked, setPlayerAttacked] = useState(false);

  // Math.random calculation values
  const range = maxVal - minVal + 1;
  const scaled = randVal * range;
  const floored = Math.floor(scaled);
  const finalResult = floored + minVal;

  const handleRollRandom = () => {
    setRandVal(Math.random());
  };

  // Trigger attack damage effect when while loop hits damage blocks
  useEffect(() => {
    if (loopType === 'while' && tab === 'loop') {
      const stepName = whileLoopStates[loopStep]?.name;
      if (stepName && stepName.includes("Run Block")) {
        setPlayerAttacked(true);
        const timer = setTimeout(() => setPlayerAttacked(false), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loopStep, loopType, tab]);

  // Loop Step states
  const forLoopStates = [
    { name: "1. Initialization", line: "let i = 1", state: "i = 1", activeBlock: "init", desc: "Executed once at start. Creates loop index variable 'i' and sets it to 1." },
    { name: "2. Condition Check", line: "i <= 3 (1 <= 3)", state: "i = 1", activeBlock: "check", desc: "Checks if 'i' is less than or equal to 3. Evaluates to true, entering loop body." },
    { name: "3. Run Block", line: "console.log('Count:', 1)", state: "i = 1", activeBlock: "body", desc: "Executes statements inside the loop body. Outputs 'Count: 1'." },
    { name: "4. Increment Expression", line: "i++", state: "i = 2 (1 + 1)", activeBlock: "incr", desc: "Increments index 'i' by 1. 'i' becomes 2." },
    { name: "5. Condition Check", line: "i <= 3 (2 <= 3)", state: "i = 2", activeBlock: "check", desc: "Condition evaluates to true. Enters loop again." },
    { name: "6. Run Block", line: "console.log('Count:', 2)", state: "i = 2", activeBlock: "body", desc: "Outputs 'Count: 2' to the browser console." },
    { name: "7. Increment Expression", line: "i++", state: "i = 3 (2 + 1)", activeBlock: "incr", desc: "Increments index 'i' by 1. 'i' becomes 3." },
    { name: "8. Condition Check", line: "i <= 3 (3 <= 3)", state: "i = 3", activeBlock: "check", desc: "Condition evaluates to true. Enters loop for the third time." },
    { name: "9. Run Block", line: "console.log('Count:', 3)", state: "i = 3", activeBlock: "body", desc: "Outputs 'Count: 3' to the browser console." },
    { name: "10. Increment Expression", line: "i++", state: "i = 4 (3 + 1)", activeBlock: "incr", desc: "Increments 'i' to 4." },
    { name: "11. Condition Check", line: "i <= 3 (4 <= 3)", state: "i = 4", activeBlock: "check", desc: "Condition evaluates to false (4 is greater than 3). Loop terminates!" }
  ];

  const whileLoopStates = [
    { name: "1. Initialization", line: "let health = 10", state: "health = 10", healthVal: 10, activeBlock: "init", desc: "Creates the loop controller variable 'health' and initializes it to 10." },
    { name: "2. Condition Check", line: "health > 0 (10 > 0)", state: "health = 10", healthVal: 10, activeBlock: "check", desc: "Checks if health is greater than 0. Evaluates to true, entering loop body." },
    { name: "3. Run Block (Damage taken)", line: "health -= 4", state: "health = 6", healthVal: 6, activeBlock: "body", desc: "Attacking! Player takes damage, decreasing health by 4 to 6." },
    { name: "4. Condition Check", line: "health > 0 (6 > 0)", state: "health = 6", healthVal: 6, activeBlock: "check", desc: "Condition evaluates to true. Loop runs again." },
    { name: "5. Run Block (Damage taken)", line: "health -= 4", state: "health = 2", healthVal: 2, activeBlock: "body", desc: "Attacking! Player takes damage, decreasing health by 4 to 2." },
    { name: "6. Condition Check", line: "health > 0 (2 > 0)", state: "health = 2", healthVal: 2, activeBlock: "check", desc: "Condition evaluates to true. Loop runs again." },
    { name: "7. Run Block (Damage taken)", line: "health -= 4", state: "health = -2", healthVal: -2, activeBlock: "body", desc: "Attacking! Player takes fatal damage, decreasing health by 4 to -2." },
    { name: "8. Condition Check", line: "health > 0 (-2 > 0)", state: "health = -2", healthVal: -2, activeBlock: "check", desc: "Condition evaluates to false. Player is defeated, loop terminates!" }
  ];

  const loopStates = loopType === 'for' ? forLoopStates : whileLoopStates;
  const currentBlock = loopStates[loopStep]?.activeBlock;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
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
        .number-line-container {

          background: #040406;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 6px;
          padding: 20px;
          position: relative;
          min-height: 120px;
          margin-top: 15px;
        }
        .number-line {
          height: 4px;
          background: #333;
          width: 100%;
          position: relative;
          top: 40px;
        }
        .number-needle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--neon-blue);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--neon-blue-glow);
          top: -4px;
          transform: translateX(-50%);
          transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .number-grid-tick {
          position: absolute;
          width: 2px;
          height: 8px;
          background: #444;
          top: -2px;
          transform: translateX(-50%);
        }
        .gravity-hammer {
          width: 2px;
          height: 35px;
          background: var(--neon-red);
          position: absolute;
          top: -38px;
          transform: translateX(-50%);
          transition: left 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .gravity-hammer::after {
          content: "🔨";
          position: absolute;
          bottom: -15px;
          left: -8px;
          font-size: 14px;
        }
        .loop-flow-box {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 6px 12px;
          font-family: monospace;
          font-size: 12px;
          color: #666;
          background: rgba(12, 12, 14, 0.5);
          transition: all 0.3s ease;
          text-align: center;
        }
        .loop-flow-box.active {
          border-color: var(--neon-blue);
          background: rgba(0, 210, 255, 0.05);
          color: #fff;
          box-shadow: 0 0 10px var(--neon-blue-dim);
        }
        .game-char {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          border: 2px solid var(--neon-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: rgba(0,210,255,0.05);
          position: relative;
          transition: all 0.2s ease;
        }
        .game-char.attacked {
          animation: char-hit 0.4s ease;
          border-color: var(--neon-red);
          background: rgba(255,0,85,0.2);
        }
        @keyframes char-hit {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 2px) rotate(-5deg); }
          40% { transform: translate(6px, -2px) rotate(5deg); }
          60% { transform: translate(-4px, 1px); }
          80% { transform: translate(2px, 0); }
          100% { transform: translate(0, 0); }
        }
        .enemy-sprite {
          font-size: 28px;
          animation: hover-bounce 2s infinite alternate;
        }
        @keyframes hover-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
      `}</style>

      {/* Tab select header */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={`sim-tab-btn ${tab === 'random' ? 'active' : ''}`} 
          onClick={() => setTab('random')}
        >
          🎲 Math.random() Vector Stretch
        </button>
        <button 
          className={`sim-tab-btn ${tab === 'loop' ? 'active' : ''}`} 
          onClick={() => { setTab('loop'); setLoopStep(0); }}
        >
          🔁 Loop Iteration Debugger
        </button>
      </div>

      {/* TAB 1: RANDOM BOUND INTEGER MACHINE */}
      {tab === 'random' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', margin: 0 }}>Random Bound Integer Simulator</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Visualize the vector transformations (Scale, Floor, Shift) required to map decimal seeds onto bounded integers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
            
            {/* Range adjustments and seed rolls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', border: '1px solid #1a1a24' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Min Range Boundary (min)</span>
                  <strong style={{ color: 'var(--neon-blue)' }}>{minVal}</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={minVal} 
                  onChange={(e) => setMinVal(Math.min(parseInt(e.target.value), maxVal - 1))}
                  style={{ width: '100%', accentColor: 'var(--neon-blue)', marginTop: '6px' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Max Range Boundary (max)</span>
                  <strong style={{ color: 'var(--neon-blue)' }}>{maxVal}</strong>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="35" 
                  value={maxVal} 
                  onChange={(e) => setMaxVal(Math.max(parseInt(e.target.value), minVal + 1))}
                  style={{ width: '100%', accentColor: 'var(--neon-blue)', marginTop: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050508', border: '1px solid #111', padding: '10px 14px', borderRadius: '4px' }}>
                <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>RANDOM SEED [0, 1):</span>
                <code style={{ fontSize: '15px', color: 'var(--neon-blue)', fontWeight: 'bold' }}>{randVal.toFixed(6)}</code>
              </div>

              <button className="btn-neon-blue" onClick={handleRollRandom} style={{ width: '100%', padding: '10px', fontSize: '13px', textTransform: 'none', letterSpacing: '0.5px' }}>
                🎲 Roll Math.random() Seed
              </button>
            </div>

            {/* Calculations and number line vector maps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px' }}>VISUAL VECTOR MAPS</div>

              {/* Number Line 1: [0, 1) Base Needle */}
              <div className="number-line-container">
                <div style={{ position: 'absolute', top: '8px', left: '15px', fontSize: '10px', color: '#666' }}>1. Base Math.random() Range [0, 1)</div>
                <div className="number-line">
                  <div className="number-grid-tick" style={{ left: '0%' }}></div>
                  <div style={{ position: 'absolute', left: '0%', top: '6px', fontSize: '9px', color: '#555', transform: 'translateX(-50%)' }}>0</div>
                  
                  <div className="number-grid-tick" style={{ left: '50%' }}></div>
                  <div style={{ position: 'absolute', left: '50%', top: '6px', fontSize: '9px', color: '#555', transform: 'translateX(-50%)' }}>0.5</div>

                  <div className="number-grid-tick" style={{ left: '100%' }}></div>
                  <div style={{ position: 'absolute', left: '100%', top: '6px', fontSize: '9px', color: '#555', transform: 'translateX(-50%)' }}>1.0</div>

                  {/* Seed needle placement */}
                  <div className="number-needle" style={{ left: `${randVal * 100}%` }}></div>
                </div>
              </div>

              {/* Number Line 2: Scaled & Floored with gravity hammer */}
              <div className="number-line-container">
                <div style={{ position: 'absolute', top: '8px', left: '15px', fontSize: '10px', color: '#666' }}>2. Scaled ({range}x) & Floored (Gravity Hammer)</div>
                <div className="number-line">
                  {/* Ticks for each integer in the scaled range */}
                  {Array.from({ length: range + 1 }).map((_, idx) => {
                    const percentage = (idx / range) * 100;
                    return (
                      <div key={idx}>
                        <div className="number-grid-tick" style={{ left: `${percentage}%` }}></div>
                        <div style={{ position: 'absolute', left: `${percentage}%`, top: '6px', fontSize: '8px', color: '#444', transform: 'translateX(-50%)' }}>{idx}</div>
                      </div>
                    );
                  })}
                  {/* Scaled decimal position needle */}
                  <div className="number-needle" style={{ left: `${(scaled / range) * 100}%`, background: '#bd00ff', borderRadius: '4px' }} title={`Scaled: ${scaled.toFixed(4)}`}></div>
                  {/* Gravity hammer dropping to floor */}
                  <div className="gravity-hammer" style={{ left: `${(scaled / range) * 100}%` }}></div>
                  {/* Floored landing target needle */}
                  <div className="number-needle" style={{ left: `${(floored / range) * 100}%`, background: 'var(--neon-green)', width: '8px', height: '8px' }} title={`Floored: ${floored}`}></div>
                </div>
              </div>

              {/* Formula numeric log box */}
              <div style={{ background: '#050508', border: '1px solid #111', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '6px' }}>FINAL BOUNDED CALCULATION</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
                  <span>Floor({randVal.toFixed(4)} * {range})</span>
                  <span>+</span>
                  <span>{minVal}</span>
                  <span>=</span>
                  <strong style={{ color: 'var(--neon-green)', textShadow: '0 0 5px var(--neon-green-glow)' }}>{finalResult}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* TAB 2: LOOP ITERATION DEBUGGING CONSOLE */
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', margin: 0 }}>Loop Iteration Stepper</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Step through loop scopes. For loops show pointer flow. While loops simulate a health damage condition.
            </p>
          </div>

          {/* Loop type select */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={loopType === 'for' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setLoopType('for'); setLoopStep(0); }}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              For Loop (let i=1; i&lt;=3; i++)
            </button>
            <button 
              className={loopType === 'while' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setLoopType('while'); setLoopStep(0); }}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              While Loop (health &gt; 0)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '20px' }}>
            
            {/* Left Column: Debugger panel and active flowchart path */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#050508', border: '1px solid #1a1a24', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '180px', textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--neon-blue)', fontWeight: 'bold' }}>ITERATION: {loopStates[loopStep]?.name}</span>
                <div style={{ background: '#000', padding: '10px 14px', borderRadius: '4px', fontFamily: 'monospace', color: '#fff', fontSize: '14px', borderLeft: '3px solid var(--neon-blue)' }}>
                  {loopStates[loopStep]?.line}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {loopStates[loopStep]?.desc}
                </p>
              </div>

              {/* Loop flowchart path */}
              {loopType === 'for' ? (
                <div style={{ display: 'flex', justifyItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                  <div className={`loop-flow-box ${currentBlock === 'init' ? 'active' : ''}`}>Initialization</div>
                  <div style={{ alignSelf: 'center', color: '#444' }}>➔</div>
                  <div className={`loop-flow-box ${currentBlock === 'check' ? 'active' : ''}`}>Condition Check</div>
                  <div style={{ alignSelf: 'center', color: '#444' }}>➔</div>
                  <div className={`loop-flow-box ${currentBlock === 'body' ? 'active' : ''}`}>Body Block</div>
                  <div style={{ alignSelf: 'center', color: '#444' }}>➔</div>
                  <div className={`loop-flow-box ${currentBlock === 'incr' ? 'active' : ''}`}>Increment</div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyItems: 'center', gap: '6px', width: '100%', justifyContent: 'space-between' }}>
                  <div className={`loop-flow-box ${currentBlock === 'init' ? 'active' : ''}`}>Init (health = 10)</div>
                  <div style={{ alignSelf: 'center', color: '#444' }}>➔</div>
                  <div className={`loop-flow-box ${currentBlock === 'check' ? 'active' : ''}`}>Check (health &gt; 0)</div>
                  <div style={{ alignSelf: 'center', color: '#444' }}>➔</div>
                  <div className={`loop-flow-box ${currentBlock === 'body' ? 'active' : ''}`}>Deduct (-4 HP)</div>
                </div>
              )}

              {/* Stepper buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-neon" 
                  onClick={() => setLoopStep(prev => Math.max(0, prev - 1))}
                  disabled={loopStep === 0}
                  style={{ padding: '6px 14px', fontSize: '12px', opacity: loopStep === 0 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  ← Back
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={() => setLoopStep(prev => Math.min(loopStates.length - 1, prev + 1))}
                  disabled={loopStep === loopStates.length - 1}
                  style={{ padding: '6px 14px', fontSize: '12px', opacity: loopStep === loopStates.length - 1 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Next Step →
                </button>
              </div>
            </div>

            {/* Right Column: Physical Variables HUD vs outputs / Health Bar Game */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Stack variables status */}
              <div style={{ background: '#000', border: '1px solid #111', padding: '12px 18px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>
                  Stack Memory State
                </div>
                <code style={{ fontSize: '15px', color: 'var(--neon-green)', fontWeight: 'bold' }}>
                  {loopStates[loopStep]?.state}
                </code>
              </div>

              {/* Loop specific visuals: Game character health bar for while loops */}
              {loopType === 'while' ? (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a1a24', padding: '15px', borderRadius: '6px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {/* Player Character */}
                  <div className={`game-char ${playerAttacked ? 'attacked' : ''}`}>
                    {loopStates[loopStep]?.healthVal > 0 ? "🛡️" : "💀"}
                    {loopStates[loopStep]?.healthVal <= 0 && (
                      <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--neon-red)', color: '#fff', fontSize: '8px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>KO</span>
                    )}
                  </div>

                  {/* Enemy monster */}
                  <div className="enemy-sprite">
                    👾
                  </div>

                  {/* Health Bar Slider */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                      <span>PLAYER HEALTH</span>
                      <strong style={{ color: loopStates[loopStep]?.healthVal > 0 ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                        {loopStates[loopStep]?.healthVal} / 10 HP
                      </strong>
                    </div>
                    {/* Visual Bar */}
                    <div style={{ height: '8px', width: '100%', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.max(0, loopStates[loopStep]?.healthVal * 10)}%`, 
                          background: loopStates[loopStep]?.healthVal > 3 ? 'var(--neon-green)' : 'var(--neon-red)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Simple browser console box for for loops */
                <div style={{ background: '#000', border: '1px solid #111', padding: '12px 18px', borderRadius: '6px', minHeight: '100px', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '10px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>
                    Browser Console Output
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--neon-blue)', textAlign: 'left' }}>
                    {loopStates
                      .slice(0, loopStep + 1)
                      .filter(s => s.activeBlock === 'body')
                      .map((s, idx) => (
                        <div key={idx}>
                          &gt; Count: {s.line.match(/Count:', (\d+)/)?.[1] || idx + 1}
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MathSim;
