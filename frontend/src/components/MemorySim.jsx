import React, { useState } from 'react';

const MemorySim = () => {
  const [simTab, setSimTab] = useState('stackheap'); // 'stackheap' or 'tdz'
  const [vars, setVars] = useState({
    a: { type: 'number', val: '10', address: null },
    b: { type: 'number', val: '10', address: null },
    obj1: { type: 'object', val: { name: 'Rohit', age: 20 }, address: '0x3A8F' },
    obj2: { type: 'object', val: { name: 'Rohit', age: 20 }, address: '0x3A8F' }
  });

  const [tdzStep, setTdzStep] = useState(0);

  const tdzCodeLines = [
    { code: "{", tdz: false, current: false, comment: "Block starts. Scope registers names 'myVar' and 'myConst' but doesn't initialize them." },
    { code: "  // ⚠️ TEMPORAL DEAD ZONE (TDZ) BEGINS", tdz: true, current: false, comment: "Variables let/const exist but cannot be accessed yet." },
    { code: "  console.log(myVar);", tdz: true, current: false, comment: "🚨 ReferenceError! Accessing 'myVar' inside its TDZ throws an error!" },
    { code: "  let myVar = 100;", tdz: false, current: false, comment: "🟢 TDZ ends for 'myVar'! It is now initialized with 100." },
    { code: "  console.log(myVar); // Outputs: 100", tdz: false, current: false, comment: "This is completely safe and prints 100." },
    { code: "}" }
  ];

  const handleCopyPrimitive = () => {
    // b = a
    setVars(prev => ({
      ...prev,
      b: { ...prev.b, val: prev.a.val }
    }));
  };

  const handleModifyPrimitive = () => {
    // b = 20
    setVars(prev => ({
      ...prev,
      b: { ...prev.b, val: '20' }
    }));
  };

  const handleCopyObject = () => {
    // obj2 = obj1
    setVars(prev => ({
      ...prev,
      obj2: { ...prev.obj2, address: prev.obj1.address }
    }));
  };

  const handleModifyObject = () => {
    // obj2.name = 'Mohan'
    // This modifies the shared heap reference
    setVars(prev => {
      const updatedVal = { ...prev.obj1.val, name: 'Mohan' };
      return {
        ...prev,
        obj1: { ...prev.obj1, val: updatedVal },
        obj2: { ...prev.obj2, val: updatedVal }
      };
    });
  };

  const resetStackHeap = () => {
    setVars({
      a: { type: 'number', val: '10', address: null },
      b: { type: 'number', val: '10', address: null },
      obj1: { type: 'object', val: { name: 'Rohit', age: 20 }, address: '0x3A8F' },
      obj2: { type: 'object', val: { name: 'Sohan', age: 20 }, address: '0x7B9C' }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          className={simTab === 'stackheap' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => { setSimTab('stackheap'); resetStackHeap(); }}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Stack vs Heap Memory Visualizer
        </button>
        <button 
          className={simTab === 'tdz' ? 'btn-neon-blue' : 'btn-neon'} 
          onClick={() => { setSimTab('tdz'); setTdzStep(0); }}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          Temporal Dead Zone (TDZ) Visualizer
        </button>
      </div>

      {simTab === 'stackheap' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '10px' }}>Value vs Reference Simulator</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Primitives are stored directly in the Stack. Objects are stored in the Heap and accessed by address references.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '20px', minHeight: '280px' }}>
            
            {/* Stack Segment */}
            <div style={{ background: '#09090b', border: '1px solid #222', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ fontSize: '15px', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                🥞 Stack (Variables)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ border: '1px dashed #444', padding: '8px', borderRadius: '4px' }}>
                  <code style={{ fontSize: '13px' }}>let a = {vars.a.val}</code>
                  <div style={{ fontSize: '11px', color: '#666' }}>Type: Number | Val: {vars.a.val}</div>
                </div>
                <div style={{ border: '1px dashed #444', padding: '8px', borderRadius: '4px' }}>
                  <code style={{ fontSize: '13px' }}>let b = {vars.b.val}</code>
                  <div style={{ fontSize: '11px', color: '#666' }}>Type: Number | Val: {vars.b.val}</div>
                </div>
                <div style={{ border: '1px dashed #444', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--neon-blue)' }}>
                  <code style={{ fontSize: '13px' }}>const obj1 = {vars.obj1.address}</code>
                  <div style={{ fontSize: '11px', color: '#666' }}>Type: Object | Address: {vars.obj1.address}</div>
                </div>
                <div style={{ border: '1px dashed #444', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--neon-blue)' }}>
                  <code style={{ fontSize: '13px' }}>const obj2 = {vars.obj2.address}</code>
                  <div style={{ fontSize: '11px', color: '#666' }}>Type: Object | Address: {vars.obj2.address}</div>
                </div>
              </div>
            </div>

            {/* Pointer Link visuals */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
                <button className="btn-neon" onClick={handleCopyPrimitive} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  Copy Primitive (let b = a)
                </button>
                <button className="btn-neon" onClick={handleModifyPrimitive} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  Modify b (b = 20)
                </button>
                <div style={{ borderBottom: '1px solid #222', margin: '5px 0' }}></div>
                <button className="btn-neon-blue" onClick={handleCopyObject} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  Copy Ref (obj2 = obj1)
                </button>
                <button className="btn-neon-blue" onClick={handleModifyObject} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  Modify Value (obj2.name = 'Mohan')
                </button>
                <button className="btn-neon" onClick={resetStackHeap} style={{ padding: '6px 10px', fontSize: '11px', opacity: 0.7 }}>
                  Reset Memory
                </button>
              </div>
            </div>

            {/* Heap Segment */}
            <div style={{ background: '#09090b', border: '1px solid #222', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ fontSize: '15px', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                📦 Heap (Objects)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#111', padding: '8px', borderRadius: '6px', border: '1px solid #333' }}>
                  <div style={{ fontSize: '10px', color: 'var(--neon-blue)', fontFamily: 'monospace' }}>Address: 0x3A8F</div>
                  <pre style={{ fontSize: '12px', color: '#fff', margin: '4px 0' }}>
                    {JSON.stringify(vars.obj1.val, null, 2)}
                  </pre>
                </div>

                {vars.obj2.address === '0x7B9C' && (
                  <div style={{ background: '#111', padding: '8px', borderRadius: '6px', border: '1px solid #333' }}>
                    <div style={{ fontSize: '10px', color: 'var(--neon-blue)', fontFamily: 'monospace' }}>Address: 0x7B9C</div>
                    <pre style={{ fontSize: '12px', color: '#fff', margin: '4px 0' }}>
                      {JSON.stringify(vars.obj2.val, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '6px', border: '1px solid #222', marginTop: '20px', fontSize: '13px', lineHeight: '1.5' }}>
            <strong>💡 Observer note:</strong><br />
            - Notice that modifying <code>b</code> does <strong>NOT</strong> change <code>a</code>. That's because primitives are copied by value.<br />
            - When you click <strong>Copy Ref (obj2 = obj1)</strong>, both <code>obj1</code> and <code>obj2</code> start pointing to the exact same Heap address (<code>0x3A8F</code>).<br />
            - Modifying <code>obj2.name</code> updates the object at <code>0x3A8F</code>, meaning <code>obj1.name</code> changes as well!
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ border: '1px solid rgba(0,210,255,0.2)' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--neon-blue)', marginBottom: '10px' }}>Temporal Dead Zone Scope Run</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Variables declared with <code>let</code> and <code>const</code> are hoisted but remain uninitialized in the TDZ until declared.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Code lines */}
            <div style={{ background: '#000', padding: '15px', borderRadius: '6px', border: '1px solid #222', fontFamily: 'monospace' }}>
              {tdzCodeLines.map((line, idx) => {
                const isActive = idx === tdzStep;
                let bg = 'transparent';
                let color = '#777';
                if (isActive) {
                  bg = line.tdz ? 'rgba(255,0,85,0.2)' : 'rgba(57,255,20,0.15)';
                  color = line.tdz ? 'var(--neon-red)' : 'var(--neon-green)';
                } else if (idx < tdzStep) {
                  color = '#333';
                }

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      background: bg, 
                      color: color, 
                      padding: '6px', 
                      borderRadius: '4px',
                      fontSize: '14px',
                      borderLeft: isActive ? `3px solid ${line.tdz ? 'var(--neon-red)' : 'var(--neon-green)'}` : 'none'
                    }}
                  >
                    <span style={{ marginRight: '10px', color: '#444' }}>{idx + 1}</span>
                    {line.code}
                  </div>
                );
              })}
            </div>

            {/* Step Explanation card */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
              <div>
                <h4 style={{ fontSize: '16px', color: '#fff', marginBottom: '8px' }}>Line {tdzStep + 1} State Info</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {tdzCodeLines[tdzStep]?.comment}
                </p>
                {tdzCodeLines[tdzStep]?.tdz && (
                  <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,0,85,0.1)', color: 'var(--neon-red)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    🚨 TEMPORAL DEAD ZONE IN FORCE
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn-neon" 
                  onClick={() => setTdzStep(prev => Math.max(0, prev - 1))}
                  disabled={tdzStep === 0}
                  style={{ padding: '4px 10px', fontSize: '12px', opacity: tdzStep === 0 ? 0.4 : 1 }}
                >
                  Prev Line
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={() => setTdzStep(prev => Math.min(tdzCodeLines.length - 1, prev + 1))}
                  disabled={tdzStep === tdzCodeLines.length - 1}
                  style={{ padding: '4px 10px', fontSize: '12px', opacity: tdzStep === tdzCodeLines.length - 1 ? 0.4 : 1 }}
                >
                  Next Line
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MemorySim;
