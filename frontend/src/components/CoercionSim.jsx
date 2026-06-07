import React, { useState } from 'react';

const CoercionSim = () => {
  const [tab, setTab] = useState('float'); // 'float' or 'coercion'
  const [coercionExpr, setCoercionExpr] = useState('[] == false');
  const [activeFloatStep, setActiveFloatStep] = useState(0);
  const [coercionStepIdx, setCoercionStepIdx] = useState(0);

  // Floating point precision steps
  const floatSteps = [
    {
      title: "1. Storing 0.1 in Memory",
      binary: "0.0001100110011001100110011001100110011001100110011001101...",
      decimal: "0.100000000000000005551115123125",
      rounded: "0.1000000000000000",
      desc: "In decimal, 0.1 is clean. In binary base-2, it repeats infinitely (0.0001100110011...). The V8 compiler cuts off at 53 bits (Double Precision), creating a tiny truncation error.",
      color: "var(--neon-blue)"
    },
    {
      title: "2. Storing 0.2 in Memory",
      binary: "0.0011001100110011001100110011001100110011001100110011010...",
      decimal: "0.200000000000000011102230246252",
      rounded: "0.2000000000000000",
      desc: "Similar to 0.1, 0.2 cannot be stored perfectly in binary. The fraction gets cut off at 53 bits and rounded up, adding another tiny error offset.",
      color: "var(--neon-blue)"
    },
    {
      title: "3. Computing the Sum (0.1 + 0.2)",
      binary: "0.010011001100110011001100110011001100110011001100110100...",
      decimal: "0.300000000000000044408920985006",
      rounded: "0.30000000000000004",
      desc: "Adding the binary approximations of 0.1 and 0.2 accumulates their rounding differences. The resulting sum resolves to 0.30000000000000004.",
      color: "#bd00ff"
    },
    {
      title: "4. Comparing against 0.3",
      binary: "0.010011001100110011001100110011001100110011001100110011...",
      decimal: "0.299999999999999988897769753748",
      rounded: "0.3000000000000000",
      desc: "Comparing the sum of 0.1+0.2 (0.30000000000000004) to direct 0.3 (0.30000000000000000). The last bit differs! The scale tilts, making 0.1 + 0.2 === 0.3 evaluate to false.",
      color: "var(--neon-red)"
    }
  ];

  // Coercion Steps Database
  const getCoercionExplanation = (expr) => {
    switch (expr) {
      case '[] == false':
        return [
          { text: "Initial: [] == false", rule: "Compare Object (left) and Boolean (right)." },
          { text: "[] == 0", rule: "Convert boolean 'false' to number 0. (Rule 4: Boolean Coercion)" },
          { text: "'' == 0", rule: "Convert empty array [] to primitive string '' via valueOf().toString(). (Rule 5: Object Coercion)" },
          { text: "0 == 0", rule: "Convert string '' to number 0. (Rule 3: String to Number)" },
          { text: "Result: true", rule: "Types match. 0 === 0 evaluates to true!" }
        ];
      case '"5" == 5':
        return [
          { text: "Initial: \"5\" == 5", rule: "Compare String (left) and Number (right)." },
          { text: "5 == 5", rule: "Convert string \"5\" to number 5. (Rule 3: String to Number)" },
          { text: "Result: true", rule: "Types match. 5 === 5 evaluates to true!" }
        ];
      case 'null == undefined':
        return [
          { text: "Initial: null == undefined", rule: "Compare null and undefined." },
          { text: "Result: true", rule: "Rule 2 (Special Case): null and undefined are loosely equal by specification design. No conversion occurs." }
        ];
      case '[] == ![]':
        return [
          { text: "Initial: [] == ![]", rule: "Compare array [] (left) and inverted array ![] (right)." },
          { text: "[] == false", rule: "Evaluate logical NOT on the right. Array [] is truthy, so ![] becomes false." },
          { text: "[] == 0", rule: "Convert boolean 'false' to number 0." },
          { text: "'' == 0", rule: "Convert left array [] to primitive string ''." },
          { text: "0 == 0", rule: "Convert string '' to number 0." },
          { text: "Result: true", rule: "0 === 0 is true! Hence, [] == ![] returns true." }
        ];
      default:
        return [];
    }
  };

  const coercionSteps = getCoercionExplanation(coercionExpr);

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
        .ieee-bit-grid {
          display: flex;
          gap: 2px;

          margin: 10px 0;
          font-family: monospace;
          font-size: 10px;
          user-select: none;
          flex-wrap: wrap;
        }
        .ieee-bit {
          width: 15px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          font-weight: bold;
          color: #000;
        }
        .ieee-bit.sign { background: var(--neon-red); }
        .ieee-bit.exponent { background: #bd00ff; color: #fff; }
        .ieee-bit.mantissa { background: var(--neon-blue); }
        .scale-balance {
          position: relative;
          width: 100%;
          max-width: 380px;
          height: 140px;
          border-bottom: 4px solid #333;
          margin: 15px auto;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .scale-fulcrum {
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 35px solid #444;
          position: absolute;
          left: calc(50% - 20px);
          bottom: 0;
          z-index: 1;
        }
        .scale-beam {
          position: absolute;
          width: 90%;
          height: 6px;
          background: #555;
          left: 5%;
          bottom: 30px;
          transform-origin: 50% 50%;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .scale-pan {
          position: absolute;
          width: 80px;
          height: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 4px;
          bottom: 36px;
          transition: bottom 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .scale-pan.left {
          left: 5%;
        }
        .scale-pan.right {
          right: 5%;
        }
        .conveyor-belt {
          background: repeating-linear-gradient(
            90deg,
            #111,
            #111 20px,
            #18181f 20px,
            #18181f 40px
          );
          height: 25px;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          border-radius: 4px;
          width: 100%;
          margin: 20px 0;
          position: relative;
        }
        .machine-piston {
          width: 60px;
          height: 35px;
          background: #252530;
          border: 2px solid #444;
          border-bottom: 4px solid var(--neon-blue);
          border-radius: 4px;
          position: absolute;
          top: -42px;
          left: calc(50% - 30px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 8px;
          color: #fff;
          font-weight: bold;
          text-transform: uppercase;
        }
        .machine-piston.active {
          animation: slam-piston 0.6s ease;
        }
        @keyframes slam-piston {
          0% { top: -42px; }
          50% { top: -8px; box-shadow: 0 0 15px var(--neon-blue-glow); }
          100% { top: -42px; }
        }
      `}</style>

      {/* Selector tab switch */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={`sim-tab-btn ${tab === 'float' ? 'active' : ''}`} 
          onClick={() => { setTab('float'); setActiveFloatStep(0); }}
        >
          ⚖️ Why 0.1 + 0.2 !== 0.3
        </button>
        <button 
          className={`sim-tab-btn ${tab === 'coercion' ? 'active' : ''}`} 
          onClick={() => { setTab('coercion'); setCoercionStepIdx(0); }}
        >
          ⚡ Loose Equality Coercion Machine
        </button>
      </div>

      {/* TAB 1: FLOATING POINT PRECISION VISUALIZER */}
      {tab === 'float' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', margin: 0 }}>IEEE-754 Precision Calculator</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Understand why binary calculations in JavaScript V8 engine produce periodic inaccuracies.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Left Column: Binary register visualization details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {floatSteps.map((stepData, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveFloatStep(idx)}
                    style={{ 
                      background: idx === activeFloatStep ? 'rgba(0, 210, 255, 0.06)' : 'rgba(255,255,255,0.01)',
                      border: idx === activeFloatStep ? '1px solid var(--neon-blue)' : '1px solid rgba(255,255,255,0.04)',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <h4 style={{ fontSize: '14px', color: idx === activeFloatStep ? '#fff' : '#888', margin: 0 }}>{stepData.title}</h4>
                    {idx === activeFloatStep && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4', margin: '6px 0 0 0' }}>
                        {stepData.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Physical 64-bit IEEE Register and Scale */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #1b1b24', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Part 1: IEEE 64-Bit Register visual mockup */}
              <div>
                <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px' }}>IEEE-754 DOUBLE-PRECISION BIT MAP (64-BIT)</span>
                
                <div className="ieee-bit-grid">
                  {/* Sign (1 bit) */}
                  <div className="ieee-bit sign" title="Sign Bit (1 bit)">0</div>
                  {/* Exponent (11 bits) */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="ieee-bit exponent" title="Exponent Bits (11 bits)">{i % 2 === 0 ? '1' : '0'}</div>
                  ))}
                  {/* Mantissa/Fraction (first 20 bits shown for width) */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="ieee-bit mantissa" title="Fraction Mantissa (52 bits total)">{i % 3 === 0 ? '1' : '0'}</div>
                  ))}
                  <div style={{ color: '#444', alignSelf: 'center', marginLeft: '4px', fontSize: '11px' }}>... +32 bits</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#666', marginTop: '4px' }}>
                  <span><span style={{ color: 'var(--neon-red)' }}>■</span> SIGN (1b)</span>
                  <span><span style={{ color: '#bd00ff' }}>■</span> EXPONENT (11b)</span>
                  <span><span style={{ color: 'var(--neon-blue)' }}>■</span> MANTISSA (52b)</span>
                </div>
              </div>

              {/* Part 2: Interactive metrics display */}
              <div style={{ background: '#050508', border: '1px solid #111', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>FLOATING POINT DEVIATION</div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', margin: '4px 0', wordBreak: 'break-all' }}>
                  <span style={{ color: '#888' }}>Binary:</span> <span style={{ color: floatSteps[activeFloatStep].color }}>{floatSteps[activeFloatStep].binary}</span>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  <span style={{ color: '#888' }}>Computed Dec:</span> <span style={{ color: 'var(--neon-green)' }}>{floatSteps[activeFloatStep].decimal}</span>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  <span style={{ color: '#888' }}>V8 String:</span> <strong style={{ color: '#fff' }}>{floatSteps[activeFloatStep].rounded}</strong>
                </div>
              </div>

              {/* Part 3: Balance Scale for the final step */}
              {activeFloatStep === 3 ? (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--neon-red)', textAlign: 'center', fontWeight: 'bold' }}>
                    0.30000000000000004 !== 0.30000000000000000
                  </div>
                  <div className="scale-balance">
                    <div className="scale-fulcrum"></div>
                    {/* Beam tilted to left since 0.30000000000000004 is heavier than 0.3 */}
                    <div className="scale-beam" style={{ transform: 'rotate(-7deg)' }}></div>
                    {/* Pans connected to the beam ends */}
                    <div className="scale-pan left" style={{ bottom: '20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#ffb3c1', display: 'block', marginTop: '-18px' }}>0.1 + 0.2</span>
                      <strong style={{ fontSize: '10px', color: 'var(--neon-red)' }}>0.30000000000000004</strong>
                    </div>
                    <div className="scale-pan right" style={{ bottom: '46px', textAlign: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#c2ffc7', display: 'block', marginTop: '-18px' }}>0.3</span>
                      <strong style={{ fontSize: '10px', color: 'var(--neon-green)' }}>0.30000000000000000</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontStyle: 'italic', fontSize: '12px' }}>
                  Select Step 4 to view the physical scale check comparison.
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: COERCION CONVEYOR BELT CONVERTER ENGINE */
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', margin: 0 }}>Loose Equality Coercion Machine</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Select an equality expression to watch the V8 coercion engine run step-by-step operand translations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
            
            {/* Left Column: Conveyor belt engine visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontFamily: 'monospace', color: '#666' }}>EXPRESSION:</label>
                <select 
                  value={coercionExpr}
                  onChange={(e) => { setCoercionExpr(e.target.value); setCoercionStepIdx(0); }}
                  style={{ background: '#0a0a0d', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}
                >
                  <option value="[] == false">[] == false</option>
                  <option value="&quot;5&quot; == 5">"5" == 5</option>
                  <option value="null == undefined">null == undefined</option>
                  <option value="[] == ![]">[] == ![]</option>
                </select>
              </div>

              {/* Conveyor Belt Space */}
              <div style={{ background: '#040406', border: '1px solid #161620', borderRadius: '8px', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                
                {/* Visual stamping piston */}
                <div 
                  className={`machine-piston ${coercionStepIdx > 0 && coercionStepIdx < coercionSteps.length - 1 ? 'active' : ''}`}
                  key={coercionStepIdx} // Key resets animation on step change
                >
                  COERCE
                </div>

                {/* Operand cards */}
                <div style={{ display: 'flex', gap: '40px', zIndex: 10, margin: '20px 0 10px 0', justifyContent: 'center', width: '100%' }}>
                  
                  {/* Left Operand card */}
                  <div style={{ 
                    background: '#0c0c10', 
                    border: '1px solid rgba(0, 210, 255, 0.3)', 
                    borderRadius: '6px', 
                    padding: '12px 18px', 
                    textAlign: 'center', 
                    minWidth: '90px',
                    boxShadow: '0 0 10px rgba(0, 210, 255, 0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '10px', color: '#666' }}>LHS OPERAND</div>
                    <strong style={{ fontSize: '18px', color: '#fff', fontFamily: 'monospace' }}>
                      {/* extract LHS value from text steps */}
                      {coercionSteps[coercionStepIdx]?.text.split('==')[0] || coercionExpr.split('==')[0]}
                    </strong>
                  </div>

                  {/* Operator card */}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px', color: 'orange', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    ==
                  </div>

                  {/* Right Operand card */}
                  <div style={{ 
                    background: '#0c0c10', 
                    border: '1px solid rgba(0, 210, 255, 0.3)', 
                    borderRadius: '6px', 
                    padding: '12px 18px', 
                    textAlign: 'center', 
                    minWidth: '90px',
                    boxShadow: '0 0 10px rgba(0, 210, 255, 0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '10px', color: '#666' }}>RHS OPERAND</div>
                    <strong style={{ fontSize: '18px', color: '#fff', fontFamily: 'monospace' }}>
                      {coercionSteps[coercionStepIdx]?.text.split('==')[1] || coercionExpr.split('==')[1]}
                    </strong>
                  </div>

                </div>

                {/* conveyor belt visual bar */}
                <div className="conveyor-belt"></div>

                {/* Final status badge inside the machine */}
                {coercionStepIdx === coercionSteps.length - 1 && (
                  <div style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid var(--neon-green)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--neon-green)', fontWeight: 'bold', zIndex: 10, animation: 'pulse 1s infinite alternate' }}>
                    ✓ SOLVED: EVALUATES TO TRUE
                  </div>
                )}
              </div>

              {/* Step iteration buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-neon"
                  onClick={() => setCoercionStepIdx(prev => Math.max(0, prev - 1))}
                  disabled={coercionStepIdx === 0}
                  style={{ padding: '6px 12px', fontSize: '11px', opacity: coercionStepIdx === 0 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  ← Reset/Back
                </button>
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#555' }}>
                  STEP {coercionStepIdx + 1} OF {coercionSteps.length}
                </div>
                <button
                  className="btn-neon-blue"
                  onClick={() => setCoercionStepIdx(prev => Math.min(coercionSteps.length - 1, prev + 1))}
                  disabled={coercionStepIdx === coercionSteps.length - 1}
                  style={{ padding: '6px 12px', fontSize: '11px', opacity: coercionStepIdx === coercionSteps.length - 1 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Next Conversion →
                </button>
              </div>

            </div>

            {/* Right Column: Flow explanation and rules logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#050508', border: '1px solid #1a1a24', padding: '20px', borderRadius: '8px', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyItems: 'flex-start', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#666', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '12px', fontWeight: 'bold' }}>
                  COERCION CONVERTER LOGS
                </div>
                
                {coercionSteps.slice(0, coercionStepIdx + 1).map((s, idx) => {
                  const isCurrent = idx === coercionStepIdx;
                  return (
                    <div 
                      key={idx}
                      style={{ 
                        margin: '6px 0', 
                        fontSize: '13px', 
                        fontFamily: 'monospace', 
                        color: isCurrent ? 'var(--neon-green)' : '#555',
                        borderLeft: isCurrent ? '3px solid var(--neon-green)' : '3px solid transparent',
                        paddingLeft: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>&gt; {s.text}</div>
                      <div style={{ fontSize: '11px', color: isCurrent ? 'var(--text-secondary)' : '#444', marginTop: '2px' }}>
                        {s.rule}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CoercionSim;
