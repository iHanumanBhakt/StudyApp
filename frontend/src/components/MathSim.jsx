import React, { useState } from 'react';

const MathSim = () => {
  const [tab, setTab] = useState('random'); // 'random' or 'loop'
  const [minVal, setMinVal] = useState(1);
  const [maxVal, setMaxVal] = useState(10);
  const [randVal, setRandVal] = useState(0.5742);
  const [loopType, setLoopType] = useState('for');
  const [loopStep, setLoopStep] = useState(0);

  // Math.random calculation values
  const range = maxVal - minVal + 1;
  const scaled = randVal * range;
  const floored = Math.floor(scaled);
  const finalResult = floored + minVal;

  const handleRollRandom = () => {
    setRandVal(Math.random());
  };

  // Loop Step states
  const forLoopStates = [
    { name: "1. Initialization", line: "let i = 1", state: "i = 1", desc: "Executed once at start. Creates index variable i and sets it to 1." },
    { name: "2. Condition Check", line: "i <= 3 (1 <= 3)", state: "i = 1", desc: "Checks if i is less than/equal to 3. Evaluates to true, entering loop body." },
    { name: "3. Run Block", line: "console.log('Count:', 1)", state: "i = 1", desc: "Prints 'Count: 1' inside the console." },
    { name: "4. Increment Expression", line: "i++", state: "i = 2 (1 + 1)", desc: "Increments i by 1. i becomes 2." },
    { name: "5. Condition Check", line: "i <= 3 (2 <= 3)", state: "i = 2", desc: "Evaluates to true. Enters loop again." },
    { name: "6. Run Block", line: "console.log('Count:', 2)", state: "i = 2", desc: "Prints 'Count: 2' in the console." },
    { name: "7. Increment Expression", line: "i++", state: "i = 3 (2 + 1)", desc: "Increments i. i becomes 3." },
    { name: "8. Condition Check", line: "i <= 3 (3 <= 3)", state: "i = 3", desc: "Evaluates to true (since 3 is equal to 3). Enters loop." },
    { name: "9. Run Block", line: "console.log('Count:', 3)", state: "i = 3", desc: "Prints 'Count: 3' in the console." },
    { name: "10. Increment Expression", line: "i++", state: "i = 4 (3 + 1)", desc: "Increments i. i becomes 4." },
    { name: "11. Condition Check", line: "i <= 3 (4 <= 3)", state: "i = 4", desc: "Condition evaluates to false (4 is larger than 3). Loop terminates!" }
  ];

  const whileLoopStates = [
    { name: "1. Initialization", line: "let health = 10", state: "health = 10", desc: "Sets up starting health variable." },
    { name: "2. Condition Check", line: "health > 0 (10 > 0)", state: "health = 10", desc: "Is health positive? Yes (true). Enters loop body." },
    { name: "3. Run Block", line: "health -= 4", state: "health = 6", desc: "Attacking! Player takes damage, health drops to 6." },
    { name: "4. Condition Check", line: "health > 0 (6 > 0)", state: "health = 6", desc: "Condition evaluates to true. Enters loop body again." },
    { name: "5. Run Block", line: "health -= 4", state: "health = 2", desc: "Attacking! Health drops to 2." },
    { name: "6. Condition Check", line: "health > 0 (2 > 0)", state: "health = 2", desc: "Condition evaluates to true. Enters loop body again." },
    { name: "7. Run Block", line: "health -= 4", state: "health = -2", desc: "Attacking! Health drops to -2." },
    { name: "8. Condition Check", line: "health > 0 (-2 > 0)", state: "health = -2", desc: "Condition evaluates to false. Player is defeated, loop terminates!" }
  ];

  const loopStates = loopType === 'for' ? forLoopStates : whileLoopStates;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={tab === 'random' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => setTab('random')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Math.random() Scaling Builder
        </button>
        <button 
          className={tab === 'loop' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => { setTab('loop'); setLoopStep(0); }}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Loop Step-by-step Executor
        </button>
      </div>

      {tab === 'random' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '10px' }}>Random Bound Integer Simulator</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            JavaScript only has <code>Math.random()</code> which outputs a float in the range [0, 1). To get integers in a range [min, max], we scale, floor, and shift it.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
            
            {/* Input Config parameters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Minimum Value (min): {minVal}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minVal} 
                  onChange={(e) => setMinVal(Math.min(parseInt(e.target.value), maxVal - 1))}
                  style={{ width: '100%', accentColor: 'var(--neon-blue)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Maximum Value (max): {maxVal}</label>
                <input 
                  type="range" 
                  min="2" 
                  max="500" 
                  value={maxVal} 
                  onChange={(e) => setMaxVal(Math.max(parseInt(e.target.value), minVal + 1))}
                  style={{ width: '100%', accentColor: 'var(--neon-blue)' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Current Random Seed:</div>
                <code style={{ fontSize: '15px', color: '#fff' }}>{randVal.toFixed(6)}</code>
              </div>

              <button className="btn-neon-blue" onClick={handleRollRandom} style={{ width: '100%', padding: '10px' }}>
                🎲 Roll Random Seed
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
                Formula: Math.floor(Math.random() * (max - min + 1)) + min
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#09090b', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #333' }}>
                  <span>1. Calculate Range (max - min + 1)</span>
                  <code style={{ color: 'var(--neon-blue)' }}>{maxVal} - {minVal} + 1 = {range}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#09090b', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #333' }}>
                  <span>2. Scale (Math.random() * range)</span>
                  <code style={{ color: 'var(--neon-blue)' }}>{randVal.toFixed(4)} * {range} = {scaled.toFixed(4)}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#09090b', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #333' }}>
                  <span>3. Floor decimals (Math.floor(scaled))</span>
                  <code style={{ color: 'var(--neon-blue)' }}>Math.floor({scaled.toFixed(4)}) = {floored}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#09090b', padding: '10px', borderRadius: '4px', borderLeft: '3px solid var(--neon-green)' }}>
                  <span>4. Shift start point (+ min)</span>
                  <code style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{floored} + {minVal} = {finalResult}</code>
                </div>
              </div>

              <div style={{ background: 'rgba(57,255,20,0.1)', padding: '15px', borderRadius: '6px', border: '1px solid var(--neon-green)', color: '#fff', textAlign: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generated Bounded Number:</span>
                <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--neon-green)', textShadow: '0 0 10px var(--neon-green-glow)' }}>
                  {finalResult}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '10px' }}>Loop Iteration Stepper</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Looping processes statements in steps. Stepping shows the state variable values updates.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={loopType === 'for' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setLoopType('for'); setLoopStep(0); }}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              For Loop (let i=1; i&lt;=3; i++)
            </button>
            <button 
              className={loopType === 'while' ? 'btn-neon-blue' : 'btn-neon'} 
              onClick={() => { setLoopType('while'); setLoopStep(0); }}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              While Loop (health &gt; 0)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
            
            {/* Visual Steps Block */}
            <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #222', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '16px', color: 'var(--neon-blue)', marginBottom: '6px' }}>
                  {loopStates[loopStep]?.name}
                </h4>
                <div style={{ background: '#000', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', color: '#fff', margin: '10px 0' }}>
                  {loopStates[loopStep]?.line}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {loopStates[loopStep]?.desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                <button 
                  className="btn-neon" 
                  onClick={() => setLoopStep(prev => Math.max(0, prev - 1))}
                  disabled={loopStep === 0}
                  style={{ padding: '4px 10px', fontSize: '12px', opacity: loopStep === 0 ? 0.4 : 1 }}
                >
                  Prev
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={() => setLoopStep(prev => Math.min(loopStates.length - 1, prev + 1))}
                  disabled={loopStep === loopStates.length - 1}
                  style={{ padding: '4px 10px', fontSize: '12px', opacity: loopStep === loopStates.length - 1 ? 0.4 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Loop state variables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#000', border: '1px solid #222', padding: '15px', borderRadius: '6px', minHeight: '120px' }}>
                <div style={{ fontSize: '11px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Stack Variables State
                </div>
                <code style={{ fontSize: '15px', color: 'var(--neon-green)' }}>
                  {loopStates[loopStep]?.state}
                </code>
              </div>

              {/* Loop Console logs accumulator */}
              <div style={{ background: '#000', border: '1px solid #222', padding: '15px', borderRadius: '6px', minHeight: '120px', fontFamily: 'monospace' }}>
                <div style={{ fontSize: '11px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Browser Console Output
                </div>
                <div style={{ fontSize: '13px', color: 'var(--neon-blue)' }}>
                  {loopStates
                    .slice(0, loopStep + 1)
                    .filter(s => s.line.includes('console.log') || s.name.includes('Run Block'))
                    .map((s, idx) => (
                      <div key={idx}>
                        &gt; {s.line.match(/log\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '') || "Iterated"}
                      </div>
                    ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MathSim;
