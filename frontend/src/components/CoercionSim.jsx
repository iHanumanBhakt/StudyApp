import React, { useState } from 'react';

const CoercionSim = () => {
  const [tab, setTab] = useState('float'); // 'float' or 'coercion'
  const [coercionExpr, setCoercionExpr] = useState('[] == false');

  // Float Inaccuracy Calculations (10-bit simulation from notes)
  const floatSteps = [
    {
      title: "Step 1: Store 0.1 in Binary (10 bits)",
      binary: "0.0001100110",
      decimal: "0.10009765625",
      desc: "In decimal, 0.1 is clean. In binary base-2, it repeats infinitely (0.0001100110011...). The computer truncates it, creating a small representation overflow."
    },
    {
      title: "Step 2: Store 0.2 in Binary (10 bits)",
      binary: "0.0011001100",
      decimal: "0.19921875",
      desc: "Like 0.1, 0.2 cannot be stored perfectly. The computer rounds it off, leaving a tiny rounding error."
    },
    {
      title: "Step 3: Accumulate the Sum (0.1 + 0.2)",
      binary: "0.0100110010",
      decimal: "0.29931640625",
      desc: "When the computer adds the stored binary approximations of 0.1 and 0.2, the tiny rounding errors add up."
    },
    {
      title: "Step 4: Compare against Stored 0.3",
      binary: "0.0100110011",
      decimal: "0.2998046875",
      desc: "The computer converts 0.3 directly to binary. Notice the last bit: 0.3 is stored as ...0011, while the sum of 0.1+0.2 is ...0010. They are different! Thus: 0.1 + 0.2 === 0.3 resolves to false!"
    }
  ];

  // Coercion Steps Builder
  const getCoercionExplanation = (expr) => {
    switch (expr) {
      case '[] == false':
        return [
          { text: "Initial: [] == false", rule: "Checking equality of Object (left) and Boolean (right)." },
          { text: "Step 1: [] == 0", rule: "Rule 4 (Boolean Coercion): Convert right-hand boolean false to number 0." },
          { text: "Step 2: '' == 0", rule: "Rule 5 (Object Coercion): Convert left-hand empty array [] to a primitive string via valueOf().toString(), resulting in empty string ''." },
          { text: "Step 3: 0 == 0", rule: "Rule 3 (String & Number): Convert left-hand string '' to number 0." },
          { text: "Result: true", rule: "Same type (Number). 0 === 0 evaluates to true! This is why [] == false is true in JS!" }
        ];
      case '"5" == 5':
        return [
          { text: "Initial: \"5\" == 5", rule: "Checking equality of String (left) and Number (right)." },
          { text: "Step 1: 5 == 5", rule: "Rule 3 (String & Number): Convert left-hand string \"5\" to number 5 and compare." },
          { text: "Result: true", rule: "Types are now matching. 5 === 5 evaluates to true!" }
        ];
      case 'null == undefined':
        return [
          { text: "Initial: null == undefined", rule: "Loose equality of null and undefined." },
          { text: "Result: true", rule: "Rule 2 (Special Case): null and undefined are loosely equal to each other by specification design. No conversion happens." }
        ];
      case '[] == ![]':
        return [
          { text: "Initial: [] == ![]", rule: "Checking equality of array [] (left) and inverted array ![] (right)." },
          { text: "Step 1: [] == false", rule: "First, solve the logical NOT on the right. An array [] is truthy, so ![] evaluates to false." },
          { text: "Step 2: [] == 0", rule: "Convert boolean false on the right to number 0." },
          { text: "Step 3: '' == 0", rule: "Convert array [] on the left to primitive string ''." },
          { text: "Step 4: 0 == 0", rule: "Convert string '' to number 0." },
          { text: "Result: true", rule: "0 === 0 is true! This is why [] == ![] returns true!" }
        ];
      default:
        return [];
    }
  };

  const coercionSteps = getCoercionExplanation(coercionExpr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={tab === 'float' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => setTab('float')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Why 0.1 + 0.2 !== 0.3 Visualizer
        </button>
        <button 
          className={tab === 'coercion' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => setTab('coercion')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Loose Equality (==) Coercion Solver
        </button>
      </div>

      {tab === 'float' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '10px' }}>IEEE-754 Precision Calculator</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Computers store decimal numbers in binary base-2, causing periodic rounding errors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {floatSteps.map((step, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '16px', 
                  borderRadius: '6px', 
                  border: '1px solid #222',
                  borderLeft: `3px solid ${idx === 3 ? 'var(--neon-red)' : 'var(--neon-blue)'}`
                }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{step.title}</h4>
                <div style={{ display: 'flex', gap: '30px', margin: '8px 0', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', display: 'block', textTransform: 'uppercase' }}>Stored Binary</span>
                    <code style={{ fontSize: '15px', color: '#fff' }}>{step.binary}</code>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', display: 'block', textTransform: 'uppercase' }}>Exact Decimal Value</span>
                    <code style={{ fontSize: '15px', color: idx === 3 ? 'var(--neon-red)' : 'var(--neon-green)' }}>{step.decimal}</code>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                  {step.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '15px' }}>Abstract Coercion Flowchart</h3>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '25px' }}>
            <label style={{ fontSize: '14px', fontFamily: 'monospace' }}>Select Expression:</label>
            <select 
              value={coercionExpr}
              onChange={(e) => setCoercionExpr(e.target.value)}
              style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              <option value="[] == false">[] == false</option>
              <option value="&quot;5&quot; == 5">"5" == 5</option>
              <option value="null == undefined">null == undefined</option>
              <option value="[] == ![]">[] == ![]</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
            {coercionSteps.map((step, idx) => {
              const isLast = idx === coercionSteps.length - 1;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '500px', 
                      background: isLast ? 'rgba(57,255,20,0.1)' : '#09090b', 
                      border: isLast ? '1px solid var(--neon-green)' : '1px solid #222',
                      padding: '12px 18px', 
                      borderRadius: '6px',
                      boxShadow: isLast ? '0 0 10px rgba(57,255,20,0.1)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'monospace', color: isLast ? 'var(--neon-green)' : '#fff' }}>
                      {step.text}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {step.rule}
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{ color: 'var(--neon-blue)', fontSize: '20px', margin: '5px 0' }}>
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoercionSim;
