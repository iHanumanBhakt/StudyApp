import React, { useState, useEffect, useRef } from 'react';

// Guided steps data for Stack vs Heap memory simulation
const GUIDED_STEPS = [
  {
    title: "1. Primitive Variable Assignment",
    code: `let a = 10;\nlet b = 10;`,
    comment: "Allocating primitive variables on the Stack. Primitives are small, fixed-size values stored directly in Stack memory slots. Each variable gets its own independent storage.",
    vars: {
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '10', stackAddr: '0x1004' },
      obj1: null,
      obj2: null
    },
    heap: [],
    logs: [
      "[SYSTEM] Allocating primitives...",
      "[STACK] Created slot for 'a' at 0x1000 with value 10",
      "[STACK] Created slot for 'b' at 0x1004 with value 10",
      "[INFO] Stack memory operates on fixed-size frames for speed and simplicity."
    ]
  },
  {
    title: "2. Copying & Reassigning Primitives",
    code: `b = a; // Copy value\nb = 20; // Reassign b`,
    comment: "When copying a primitive, its value is duplicated into a new Stack slot. Modifying 'b' has absolutely no effect on 'a'. They remain completely independent.",
    vars: {
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '20', stackAddr: '0x1004' },
      obj1: null,
      obj2: null
    },
    heap: [],
    logs: [
      "[STACK] Copied value of 'a' (10) into 'b' (slot 0x1004)",
      "[STACK] Reassigned 'b' to 20 in slot 0x1004",
      "[INFO] 'a' in slot 0x1000 remains 10. Primitives are passed and copied BY VALUE."
    ]
  },
  {
    title: "3. Allocating Objects on the Heap",
    code: `const obj1 = { name: "Rohit", age: 20 };\nconst obj2 = { name: "Sohan", age: 20 };`,
    comment: "Objects have dynamic sizes, so they are stored in Heap memory. The Stack variables only hold the reference pointer (memory address) pointing to the Heap blocks.",
    vars: {
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '20', stackAddr: '0x1004' },
      obj1: { type: 'object', val: '0x3A8F', stackAddr: '0x1008' },
      obj2: { type: 'object', val: '0x7B9C', stackAddr: '0x100C' }
    },
    heap: [
      { address: '0x3A8F', val: { name: 'Rohit', age: 20 }, active: true, orphaned: false },
      { address: '0x7B9C', val: { name: 'Sohan', age: 20 }, active: true, orphaned: false }
    ],
    logs: [
      "[HEAP] Allocated object { name: 'Rohit', age: 20 } at address 0x3A8F",
      "[STACK] Set 'obj1' in slot 0x1008 to pointer 0x3A8F",
      "[HEAP] Allocated object { name: 'Sohan', age: 20 } at address 0x7B9C",
      "[STACK] Set 'obj2' in slot 0x100C to pointer 0x7B9C",
      "[INFO] Pointers (0x3A8F, 0x7B9C) are drawn as physical connections to Heap cells."
    ]
  },
  {
    title: "4. Copying Objects (Reference Copying)",
    code: `const obj2 = obj1;`,
    comment: "Copying an object copies its reference address (pointer) from one stack cell to another. Both variables now point to 0x3A8F. The original object at 0x7B9C is now orphaned and marked for Garbage Collection!",
    vars: {
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '20', stackAddr: '0x1004' },
      obj1: { type: 'object', val: '0x3A8F', stackAddr: '0x1008' },
      obj2: { type: 'object', val: '0x3A8F', stackAddr: '0x100C' }
    },
    heap: [
      { address: '0x3A8F', val: { name: 'Rohit', age: 20 }, active: true, orphaned: false },
      { address: '0x7B9C', val: { name: 'Sohan', age: 20 }, active: false, orphaned: true }
    ],
    logs: [
      "[STACK] Copied pointer of 'obj1' (0x3A8F) into 'obj2' (slot 0x100C)",
      "[INFO] Both 'obj1' and 'obj2' now point to the same Heap address 0x3A8F",
      "[GC] Heap block at 0x7B9C has 0 active references! Marked for Garbage Collection."
    ]
  },
  {
    title: "5. Mutating Shared Heap Object",
    code: `obj2.name = "Mohan";`,
    comment: "Modifying a property via 'obj2' updates the shared object at 0x3A8F. Because 'obj1' points to the same address, reading 'obj1.name' also returns 'Mohan'!",
    vars: {
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '20', stackAddr: '0x1004' },
      obj1: { type: 'object', val: '0x3A8F', stackAddr: '0x1008' },
      obj2: { type: 'object', val: '0x3A8F', stackAddr: '0x100C' }
    },
    heap: [
      { address: '0x3A8F', val: { name: 'Mohan', age: 20 }, active: true, orphaned: false },
      { address: '0x7B9C', val: { name: 'Sohan', age: 20 }, active: false, orphaned: true }
    ],
    logs: [
      "[STACK] Read address of 'obj2' (0x3A8F)",
      "[HEAP] Modified key 'name' of object at 0x3A8F to 'Mohan'",
      "[INFO] obj1.name is now also 'Mohan' because they share the heap cell!",
      "[SUCCESS] Memory walk complete. Primitives copy by value, objects copy by reference."
    ]
  }
];

// Temporal Dead Zone steps for visual scope debugger
const TDZ_STEPS = [
  {
    line: 0,
    title: "1. Block Scope Entered",
    codeIdx: 0,
    comment: "The execution enters the block {}. The JS engine scans the block and hoists all variable declarations. It registers 'myVar' (let) and 'myConst' (const) in scope memory, but does NOT initialize them. They are trapped in the Temporal Dead Zone.",
    scopeVars: {
      myVar: { status: 'tdz', val: 'Uninitialized (ReferenceError)' },
      myConst: { status: 'tdz', val: 'Uninitialized (ReferenceError)' }
    }
  },
  {
    line: 1,
    title: "2. Inside the TDZ Zone",
    codeIdx: 1,
    comment: "We are now inside the block code, before the declarations of 'myVar' or 'myConst'. Any attempt to access them right now will crash the program with a ReferenceError.",
    scopeVars: {
      myVar: { status: 'tdz', val: 'Uninitialized (ReferenceError)' },
      myConst: { status: 'tdz', val: 'Uninitialized (ReferenceError)' }
    }
  },
  {
    line: 2,
    title: "3. Illegal Read Attempt (Crash!)",
    codeIdx: 2,
    comment: "🚨 ReferenceError! The engine attempts to run 'console.log(myVar)'. Since 'myVar' is still in the Temporal Dead Zone, the browser immediately throws a ReferenceError. Execution halts.",
    scopeVars: {
      myVar: { status: 'tdz', val: 'Uninitialized (ReferenceError)', error: true },
      myConst: { status: 'tdz', val: 'Uninitialized (ReferenceError)' }
    }
  },
  {
    line: 3,
    title: "4. Declaration & Initialization",
    codeIdx: 3,
    comment: "🟢 TDZ ends for 'myVar'! The execution line 'let myVar = 100;' runs. The variable is initialized to 100. It is now safe to access. Note: 'myConst' remains trapped in the TDZ until its own declaration statement runs.",
    scopeVars: {
      myVar: { status: 'safe', val: '100' },
      myConst: { status: 'tdz', val: 'Uninitialized (ReferenceError)' }
    }
  },
  {
    line: 4,
    title: "5. Safe Variable Access",
    codeIdx: 4,
    comment: "Success! 'console.log(myVar)' runs safely and outputs 100 to the console. The variable is fully initialized and out of the TDZ.",
    scopeVars: {
      myVar: { status: 'safe', val: '100' },
      myConst: { status: 'tdz', val: 'Uninitialized (ReferenceError)' }
    }
  }
];

const MemorySim = () => {
  const [simTab, setSimTab] = useState('stackheap'); // 'stackheap' or 'tdz'
  const [simMode, setSimMode] = useState('guided'); // 'guided' or 'manual'
  
  // Guided mode state
  const [guidedStep, setGuidedStep] = useState(0);
  
  // Manual mode state
  const [vars, setVars] = useState({
    a: { type: 'number', val: '10', stackAddr: '0x1000' },
    b: { type: 'number', val: '10', stackAddr: '0x1004' },
    obj1: null,
    obj2: null
  });
  const [heapList, setHeapList] = useState([]);
  const [manualLogs, setManualLogs] = useState([
    "[SYSTEM] Manual Sandbox Playground Initialized.",
    "[INFO] Click buttons below to simulate memory allocation manually!"
  ]);

  // TDZ state
  const [tdzStep, setTdzStep] = useState(0);

  // Reference for measuring coordinates for lines
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({});

  // Helper to append log in manual mode
  const logManual = (text) => {
    setManualLogs(prev => [...prev, text]);
  };

  // Manual actions
  const handleManualReset = () => {
    setVars({
      a: { type: 'number', val: '10', stackAddr: '0x1000' },
      b: { type: 'number', val: '10', stackAddr: '0x1004' },
      obj1: null,
      obj2: null
    });
    setHeapList([]);
    setManualLogs([
      "[SYSTEM] Memory reset to clean primitive state.",
      "[STACK] 'a' = 10, 'b' = 10 allocated directly on Stack."
    ]);
  };

  const handleManualCopyPrimitive = () => {
    setVars(prev => ({
      ...prev,
      b: { ...prev.b, val: prev.a.val }
    }));
    logManual(`[STACK] Copied 'a' value (${vars.a.val}) into 'b' slot. Primitives copy by value.`);
  };

  const handleManualModifyPrimitive = () => {
    setVars(prev => ({
      ...prev,
      b: { ...prev.b, val: '20' }
    }));
    logManual(`[STACK] Reassigned 'b' = 20. Notice 'a' remains ${vars.a.val} because they are separate memory addresses.`);
  };

  const handleManualAllocateObjects = () => {
    setHeapList([
      { address: '0x3A8F', val: { name: 'Rohit', age: 20 }, active: true, orphaned: false },
      { address: '0x7B9C', val: { name: 'Sohan', age: 20 }, active: true, orphaned: false }
    ]);
    setVars(prev => ({
      ...prev,
      obj1: { type: 'object', val: '0x3A8F', stackAddr: '0x1008' },
      obj2: { type: 'object', val: '0x7B9C', stackAddr: '0x100C' }
    }));
    logManual("[HEAP] Allocated two objects at Heap addresses 0x3A8F and 0x7B9C.");
    logManual("[STACK] Stored pointer addresses in 'obj1' and 'obj2' Stack slots.");
  };

  const handleManualCopyReference = () => {
    if (!vars.obj1) {
      logManual("[ERROR] Allocate objects first before attempting reference copying!");
      return;
    }
    setVars(prev => ({
      ...prev,
      obj2: { ...prev.obj2, val: prev.obj1.val }
    }));
    logManual("[STACK] Copied 'obj1' reference (0x3A8F) into 'obj2' Stack slot.");
    logManual("[GC] Address 0x7B9C has 0 variables pointing to it. Marked for Garbage Collection!");
  };

  const handleManualModifyObject = () => {
    if (!vars.obj1) {
      logManual("[ERROR] Allocate objects first before attempting modification!");
      return;
    }
    setHeapList(prev => {
      return prev.map(item => {
        if (item.address === '0x3A8F') {
          return { ...item, val: { name: 'Mohan', age: 20 } };
        }
        return item;
      });
    });
    logManual("[HEAP] Modified key 'name' of object at 0x3A8F to 'Mohan'.");
    logManual("[INFO] Both obj1 and obj2 see the change because they share the 0x3A8F heap reference!");
  };

  // Recalculate coordinates of slots to draw SVG arrows
  const updateCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords = {};

    const stackIds = ['stack-a', 'stack-b', 'stack-obj1', 'stack-obj2'];
    const heapAddresses = ['0x3A8F', '0x7B9C'];

    stackIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[id] = {
          x: rect.right - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      }
    });

    heapAddresses.forEach(addr => {
      const el = document.getElementById(`heap-${addr}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[addr] = {
          x: rect.left - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top
        };
      }
    });

    setCoords(newCoords);
  };

  // Coordinates updater side effect
  useEffect(() => {
    updateCoordinates();
    const timer = setTimeout(updateCoordinates, 60);
    window.addEventListener('resize', updateCoordinates);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoordinates);
    };
  }, [simTab, guidedStep, simMode, vars, heapList]);

  // Determine active states
  const activeVars = simMode === 'guided' ? GUIDED_STEPS[guidedStep].vars : vars;
  
  // Calculate dynamic orphan states for manual heap blocks
  const getManualHeap = () => {
    if (heapList.length === 0) return [];
    const pointsTo3A8F = (vars.obj1?.val === '0x3A8F') || (vars.obj2?.val === '0x3A8F');
    const pointsTo7B9C = (vars.obj1?.val === '0x7B9C') || (vars.obj2?.val === '0x7B9C');
    
    return [
      { address: '0x3A8F', val: heapList[0]?.val || { name: 'Rohit', age: 20 }, active: pointsTo3A8F, orphaned: !pointsTo3A8F },
      { address: '0x7B9C', val: heapList[1]?.val || { name: 'Sohan', age: 20 }, active: pointsTo7B9C, orphaned: !pointsTo7B9C }
    ];
  };

  const activeHeap = simMode === 'guided' ? GUIDED_STEPS[guidedStep].heap : getManualHeap();
  const activeLogs = simMode === 'guided' ? GUIDED_STEPS[guidedStep].logs : manualLogs;

  const tdzLines = [
    "{",
    "  // ⚠️ TEMPORAL DEAD ZONE (TDZ) BEGINS",
    "  console.log(myVar); // ReferenceError!",
    "  let myVar = 100; // TDZ ends for myVar",
    "  console.log(myVar); // Outputs 100",
    "}"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      {/* Tab Switcher Style Tag */}
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
        .sim-tab-btn.active {
          color: var(--neon-blue);
          border-color: var(--neon-blue);
          background: rgba(0, 210, 255, 0.05);
          box-shadow: 0 0 10px rgba(0, 210, 255, 0.15);
        }
        .mode-badge {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mode-badge.active {
          background: var(--neon-blue);
          color: #000;
          box-shadow: 0 0 8px var(--neon-blue-glow);
        }
        .mode-badge.inactive {
          background: rgba(255, 255, 255, 0.04);
          color: #666;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .cell-address {
          font-family: monospace;
          font-size: 11px;
          color: #555;
        }
        .stack-cell-highlight {
          border-left: 3px solid var(--neon-green);
        }
        .stack-cell-highlight.ref {
          border-left: 3px solid var(--neon-blue);
        }
        .heap-cell-highlight {
          box-shadow: 0 0 15px rgba(0, 210, 255, 0.1) inset;
        }
        .gc-flash {
          animation: red-pulse 1.5s infinite alternate;
        }
        @keyframes red-pulse {
          0% { box-shadow: 0 0 5px rgba(255,0,85,0.1); border-color: rgba(255,0,85,0.2); }
          100% { box-shadow: 0 0 15px rgba(255,0,85,0.4); border-color: rgba(255,0,85,0.6); }
        }
        .tdz-barrier-line {
          height: 4px;
          background: repeating-linear-gradient(
            45deg,
            #ff0055,
            #ff0055 10px,
            #000 10px,
            #000 20px
          );
          box-shadow: 0 0 10px rgba(255, 0, 85, 0.6);
          animation: barrier-glow 1.5s infinite alternate;
        }
        @keyframes barrier-glow {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        .code-row {
          font-family: monospace;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .code-row.current-active {
          background: rgba(57, 255, 20, 0.08);
          color: var(--neon-green);
          border-left: 3px solid var(--neon-green);
        }
        .code-row.current-tdz-error {
          background: rgba(255, 0, 85, 0.08);
          color: var(--neon-red);
          border-left: 3px solid var(--neon-red);
        }
        .pointer-flow {
          stroke-dasharray: 8, 4;
          animation: stroke-slide 1.2s linear infinite;
        }
        @keyframes stroke-slide {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>

      {/* Simulator Menu Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`sim-tab-btn ${simTab === 'stackheap' ? 'active' : ''}`}
            onClick={() => setSimTab('stackheap')}
          >
            🥞 Stack vs Heap Visualizer
          </button>
          <button 
            className={`sim-tab-btn ${simTab === 'tdz' ? 'active' : ''}`}
            onClick={() => { setSimTab('tdz'); setTdzStep(0); }}
          >
            🔒 Temporal Dead Zone Scope
          </button>
        </div>

        {simTab === 'stackheap' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span 
              className={`mode-badge ${simMode === 'guided' ? 'active' : 'inactive'}`}
              onClick={() => { setSimMode('guided'); setGuidedStep(0); }}
            >
              📖 Guided Tour
            </span>
            <span 
              className={`mode-badge ${simMode === 'manual' ? 'active' : 'inactive'}`}
              onClick={() => { setSimMode('manual'); handleManualReset(); }}
            >
              🧪 Manual Sandbox
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: STACK VS HEAP MEMORY VISUALIZER */}
      {simTab === 'stackheap' ? (
        <div className="glass-card" style={{ border: '1px solid rgba(0, 210, 255, 0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          
          {/* Section Header Description */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '22px', color: 'var(--neon-blue)', margin: 0 }}>
                {simMode === 'guided' ? 'Memory Guided Tour' : 'Interactive Sandbox Playground'}
              </h3>
              <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>V8 RUNTIME SIMULATION</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>
              {simMode === 'guided' 
                ? 'Follow the step-by-step lifecycle of primitives and objects to visualize exactly how JS allocates memory.' 
                : 'Click memory actions in the controller panel to freely manipulate stack allocations and heap object properties.'}
            </p>
          </div>

          {/* MAIN VISUALIZATION FRAME (REFS TO DRAW CONNECTOR LINES) */}
          <div 
            ref={containerRef}
            style={{ 
              position: 'relative', 
              display: 'grid', 
              gridTemplateColumns: '1.2fr 0.3fr 1.2fr', 
              gap: '15px', 
              background: '#040406', 
              borderRadius: '8px', 
              border: '1px solid rgba(255,255,255,0.04)', 
              padding: '25px', 
              minHeight: '340px',
              overflow: 'hidden'
            }}
          >
            
            {/* SVG OVERLAY CANVAS FOR DRAWING CURVED BEZIER CONNECTORS */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {/* Draw connections if variables and coords exist */}
              {['obj1', 'obj2'].map(objKey => {
                const item = activeVars[objKey];
                if (!item || !item.val) return null;
                
                const startPoint = coords[`stack-${objKey}`];
                const endPoint = coords[item.val]; // points to heap address e.g. '0x3A8F'
                
                if (!startPoint || !endPoint) return null;
                
                const color = objKey === 'obj1' ? 'var(--neon-blue)' : '#bd00ff';
                const dx = Math.abs(endPoint.x - startPoint.x) * 0.45;
                const pathData = `M ${startPoint.x} ${startPoint.y} C ${startPoint.x + dx} ${startPoint.y}, ${endPoint.x - dx} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`;
                
                return (
                  <g key={objKey}>
                    {/* Shadow blur glow line */}
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="5" 
                      opacity="0.12" 
                      style={{ filter: 'blur(3px)' }} 
                    />
                    {/* Glowing active connector path */}
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke={color} 
                      strokeWidth="2" 
                      opacity="0.75" 
                      className="pointer-flow" 
                    />
                    {/* Glowing flowing electrical signal node */}
                    <circle r="3.5" fill="#fff" style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
                      <animateMotion path={pathData} dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* COLUMN A: CALL STACK FRAME */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 2 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--neon-green)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>🥞 Stack Frame</span>
                <h4 style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0 0' }}>Context: Global Scope</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Variable A Slot */}
                {activeVars.a && (
                  <div 
                    id="stack-a" 
                    className="stack-slot stack-cell-highlight"
                    style={{ background: 'rgba(15, 15, 20, 0.85)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div>
                      <div className="cell-address">Address: {activeVars.a.stackAddr}</div>
                      <span style={{ color: 'var(--neon-green)', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>let a</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#666', background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '3px' }}>PRIMITIVE</span>
                      <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '15px' }}>{activeVars.a.val}</strong>
                    </div>
                  </div>
                )}

                {/* Variable B Slot */}
                {activeVars.b && (
                  <div 
                    id="stack-b" 
                    className="stack-slot stack-cell-highlight"
                    style={{ background: 'rgba(15, 15, 20, 0.85)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div>
                      <div className="cell-address">Address: {activeVars.b.stackAddr}</div>
                      <span style={{ color: 'var(--neon-green)', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>let b</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', color: '#666', background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '3px' }}>PRIMITIVE</span>
                      <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '15px' }}>{activeVars.b.val}</strong>
                    </div>
                  </div>
                )}

                {/* Variable Obj1 Slot */}
                {activeVars.obj1 && (
                  <div 
                    id="stack-obj1" 
                    className="stack-slot stack-cell-highlight ref"
                    style={{ background: 'rgba(15, 15, 20, 0.85)', border: '1px solid rgba(0, 210, 255, 0.15)' }}
                  >
                    <div>
                      <div className="cell-address">Address: {activeVars.obj1.stackAddr}</div>
                      <span style={{ color: 'var(--neon-blue)', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>const obj1</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--neon-blue)', background: 'rgba(0, 210, 255, 0.08)', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>REFERENCE</span>
                      <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', background: '#0e1520', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
                        {activeVars.obj1.val}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Variable Obj2 Slot */}
                {activeVars.obj2 && (
                  <div 
                    id="stack-obj2" 
                    className="stack-slot stack-cell-highlight ref"
                    style={{ 
                      background: 'rgba(15, 15, 20, 0.85)', 
                      border: '1px solid rgba(189, 0, 255, 0.25)',
                      borderLeftColor: '#bd00ff'
                    }}
                  >
                    <div>
                      <div className="cell-address">Address: {activeVars.obj2.stackAddr}</div>
                      <span style={{ color: '#bd00ff', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>const obj2</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', color: '#bd00ff', background: 'rgba(189, 0, 255, 0.08)', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>REFERENCE</span>
                      <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', background: '#1c0e25', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(189, 0, 255, 0.2)' }}>
                        {activeVars.obj2.val}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Empty placeholder stack slot if no vars declared */}
                {!activeVars.a && !activeVars.obj1 && (
                  <div style={{ color: '#444', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
                    Stack Frame Empty.<br />Declare variables to view allocation slots.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN B: ANCHOR MIDDLE SECTION */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '1px', height: '80%', borderRight: '1px dashed rgba(255,255,255,0.06)' }}></div>
            </div>

            {/* COLUMN C: HEAP ALLOCATION SPACE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 2 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#bd00ff', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>📦 Heap Space</span>
                <h4 style={{ fontSize: '14px', color: '#fff', margin: '2px 0 0 0' }}>Dynamic Memory Pool</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeHeap.map((block) => (
                  <div 
                    key={block.address}
                    id={`heap-${block.address}`}
                    className={`heap-block ${block.orphaned ? 'orphaned gc-flash' : 'active'}`}
                    style={{
                      border: block.orphaned ? '1px dashed rgba(255, 0, 85, 0.4)' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', fontFamily: 'monospace' }}>ADDR: {block.address}</span>
                      {!block.orphaned ? (
                        <span style={{ fontSize: '9px', color: 'var(--neon-green)', background: 'rgba(57, 255, 20, 0.08)', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                          CONNECTED
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', color: 'var(--neon-red)', background: 'rgba(255, 0, 85, 0.08)', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>
                          UNREACHABLE
                        </span>
                      )}
                    </div>

                    <pre style={{ margin: 0, fontSize: '12px', color: block.orphaned ? '#666' : '#00d2ff', fontFamily: 'monospace', textAlign: 'left', lineHeight: '1.4' }}>
                      {JSON.stringify(block.val, null, 2)}
                    </pre>
                  </div>
                ))}

                {activeHeap.length === 0 && (
                  <div style={{ color: '#444', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                    Heap Empty.<br />Allocate objects (non-primitives) to trigger dynamic heap memory slots.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* LOWER INTERACTIVE ACTIONS & DETAILS BLOCK */}
          {simMode === 'guided' ? (
            /* Guided Mode Navigation Controls */
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Guided Step Info Card */}
              <div style={{ background: '#09090c', border: '1px solid #1a1a24', borderRadius: '8px', padding: '15px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '15px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--neon-blue)', fontWeight: 'bold', letterSpacing: '0.5px' }}>ACTIVE CODE SNIPPET</span>
                  <pre style={{ background: '#000', padding: '10px', borderRadius: '4px', border: '1px solid #222', marginTop: '8px', margin: 0, overflowX: 'auto' }}>
                    <code style={{ fontSize: '13px', color: '#00d2ff', display: 'block', whiteSpace: 'pre' }}>
                      {GUIDED_STEPS[guidedStep].code}
                    </code>
                  </pre>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>STEP NARRATION</span>
                  <h4 style={{ fontSize: '15px', color: '#fff', margin: '4px 0 6px 0' }}>{GUIDED_STEPS[guidedStep].title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {GUIDED_STEPS[guidedStep].comment}
                  </p>
                </div>
              </div>

              {/* Guided Navigation Buttons */}
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {GUIDED_STEPS.map((_, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => setGuidedStep(idx)}
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: idx === guidedStep ? 'var(--neon-blue)' : 'rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-neon"
                    onClick={() => setGuidedStep(prev => Math.max(0, prev - 1))}
                    disabled={guidedStep === 0}
                    style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'none', letterSpacing: '1px', opacity: guidedStep === 0 ? 0.3 : 1 }}
                  >
                    ← Previous Step
                  </button>
                  {guidedStep < GUIDED_STEPS.length - 1 ? (
                    <button
                      className="btn-neon-blue"
                      onClick={() => setGuidedStep(prev => Math.min(GUIDED_STEPS.length - 1, prev + 1))}
                      style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'none', letterSpacing: '1px' }}
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      className="btn-neon-blue"
                      onClick={() => { setSimMode('manual'); handleManualReset(); }}
                      style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'none', letterSpacing: '1px', borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
                    >
                      🚀 Enter Sandbox Mode
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Manual Sandbox Action Controls */
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                <button 
                  className="btn-neon" 
                  onClick={handleManualCopyPrimitive}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Copy Primitive (b = a)
                </button>
                <button 
                  className="btn-neon" 
                  onClick={handleManualModifyPrimitive}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Modify b (b = 20)
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={handleManualAllocateObjects}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Allocate Objects (obj1 & obj2)
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={handleManualCopyReference}
                  disabled={heapList.length === 0}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px', opacity: heapList.length === 0 ? 0.4 : 1 }}
                >
                  Copy Ref (obj2 = obj1)
                </button>
                <button 
                  className="btn-neon-blue" 
                  onClick={handleManualModifyObject}
                  disabled={heapList.length === 0}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px', opacity: heapList.length === 0 ? 0.4 : 1 }}
                >
                  Mutate obj2.name = 'Mohan'
                </button>
                <button 
                  className="btn-neon" 
                  onClick={handleManualReset}
                  style={{ padding: '8px 12px', fontSize: '12px', textTransform: 'none', letterSpacing: '0.5px', color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}
                >
                  Reset Memory
                </button>
              </div>
            </div>
          )}

          {/* SIMULATION CONSOLE LOG TERMINAL */}
          <div style={{ marginTop: '20px', background: '#000', border: '1px solid #111', borderRadius: '6px', padding: '12px 18px', fontFamily: 'monospace', fontSize: '13px', maxHeight: '120px', overflowY: 'auto' }}>
            <div style={{ color: '#555', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              📟 ENGINE RUNTIME EXECUTION LOGS
            </div>
            {activeLogs.map((log, idx) => {
              let color = '#ccc';
              if (log.startsWith('[STACK]')) color = 'var(--neon-green)';
              else if (log.startsWith('[HEAP]')) color = '#bd00ff';
              else if (log.startsWith('[GC]')) color = 'var(--neon-red)';
              else if (log.startsWith('[SYSTEM]')) color = 'var(--neon-blue)';
              else if (log.startsWith('[ERROR]')) color = 'var(--neon-red)';
              
              return (
                <div key={idx} style={{ color, marginBottom: '4px', textAlign: 'left' }}>
                  &gt; {log}
                </div>
              );
            })}
          </div>

          {/* CONCEPT SUMMARIZATION SECTION (REMOVE CONFUSION) */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '16px', borderRadius: '6px', marginTop: '20px', fontSize: '13px', lineHeight: '1.6' }}>
            <strong style={{ color: '#fff', fontSize: '14px' }}>💡 Absolute Key Takeaways (Mental Model):</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>
                <strong style={{ color: 'var(--neon-green)' }}>Stack Memory:</strong> Stores variables holding values that have direct fixed sizes (Numbers, Booleans, Strings, undefined). Copying duplicates the physical value.
              </li>
              <li>
                <strong style={{ color: 'var(--neon-blue)' }}>Heap Memory:</strong> Stores unordered, dynamically resizable objects. Stack variables only store their reference pointer (hex address).
              </li>
              <li>
                <strong style={{ color: '#bd00ff' }}>Pointer Sharing:</strong> Copying an object copies the hex reference address, not the object. Modifying the object via one reference affects all variables pointing to that same address.
              </li>
              <li>
                <strong style={{ color: 'var(--neon-red)' }}>Garbage Collection:</strong> If an object in the Heap has 0 stack variables referencing its address, the Garbage Collector automatically cleans it to free system RAM.
              </li>
            </ul>
          </div>

        </div>
      ) : (
        /* SECTION 2: TEMPORAL DEAD ZONE SCOPE RUN */
        <div className="glass-card" style={{ border: '1px solid rgba(255, 0, 85, 0.15)', background: 'rgba(5, 5, 8, 0.8)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--neon-red)', margin: 0 }}>Temporal Dead Zone Debugger</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>
              Step through code line-by-line to see how let/const declarations exist in memory but remain locked behind the TDZ barrier.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '20px' }}>
            
            {/* LEFT SIDE: IDE CODE PANELS WITH ACTIVE POINTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#000', padding: '15px', borderRadius: '6px', border: '1px solid #1a1a24', fontFamily: 'monospace' }}>
                <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px', borderBottom: '1px solid #111', paddingBottom: '4px' }}>
                  FILE: tdz_scope_demo.js
                </div>
                {tdzLines.map((line, idx) => {
                  const isActive = idx === tdzStep;
                  const isCurrentError = isActive && TDZ_STEPS[tdzStep]?.scopeVars?.myVar?.error;
                  
                  let rowClass = "code-row";
                  if (isCurrentError) rowClass += " current-tdz-error";
                  else if (isActive) rowClass += " current-active";
                  
                  return (
                    <div key={idx} className={rowClass}>
                      <span style={{ color: '#444', minWidth: '20px', userSelect: 'none' }}>{idx + 1}</span>
                      <span style={{ fontSize: '13px' }}>{line}</span>
                    </div>
                  );
                })}
              </div>

              {/* IDE Step Navigation controls */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button
                  className="btn-neon"
                  onClick={() => setTdzStep(prev => Math.max(0, prev - 1))}
                  disabled={tdzStep === 0}
                  style={{ padding: '6px 14px', fontSize: '12px', opacity: tdzStep === 0 ? 0.3 : 1, textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  ← Previous Line
                </button>
                <button
                  className="btn-neon-blue"
                  onClick={() => setTdzStep(prev => Math.min(TDZ_STEPS.length - 1, prev + 1))}
                  disabled={tdzStep === TDZ_STEPS.length - 1}
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '12px', 
                    opacity: tdzStep === TDZ_STEPS.length - 1 ? 0.3 : 1,
                    borderColor: 'var(--neon-red)',
                    color: 'var(--neon-red)',
                    textTransform: 'none',
                    letterSpacing: '0.5px'
                  }}
                >
                  Execute Next Line →
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: SCOPE ENVIRONMENT VISUALIZATION & FORCE FIELD BARRIER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(0,0,0,0.4)', border: '1px solid #1a1a24', padding: '20px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--neon-red)', fontWeight: 'bold', letterSpacing: '1px' }}>ENVIRONMENT RECORD</span>
                <h4 style={{ fontSize: '15px', color: '#fff', marginTop: '2px' }}>Lexical Scope: Block Scope</h4>
              </div>

              {/* Variables details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '5px 0' }}>
                {/* myVar Row */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: TDZ_STEPS[tdzStep].scopeVars.myVar.error ? '1px solid var(--neon-red)' : '1px solid rgba(255,255,255,0.06)', 
                  padding: '10px 14px', 
                  borderRadius: '5px' 
                }}>
                  <span style={{ color: 'var(--neon-green)', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>let myVar</span>
                  
                  {TDZ_STEPS[tdzStep].scopeVars.myVar.status === 'tdz' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--neon-red)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🔒 TDZ</span>
                      <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>Uninitialized</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon-green)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🔓 ACTIVE</span>
                      <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'monospace' }}>{TDZ_STEPS[tdzStep].scopeVars.myVar.val}</strong>
                    </div>
                  )}
                </div>

                {/* myConst Row */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: '10px 14px', 
                  borderRadius: '5px' 
                }}>
                  <span style={{ color: '#bd00ff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>const myConst</span>
                  
                  {TDZ_STEPS[tdzStep].scopeVars.myConst.status === 'tdz' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--neon-red)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🔒 TDZ</span>
                      <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>Uninitialized</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon-green)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🔓 ACTIVE</span>
                      <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'monospace' }}>{TDZ_STEPS[tdzStep].scopeVars.myConst.val}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* FORCE FIELD BARRIER VISUALIZATION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--neon-red)', fontWeight: 'bold' }}>
                  <span>TEMPORAL DEAD ZONE BARRIER</span>
                  {TDZ_STEPS[tdzStep].scopeVars.myVar.status === 'tdz' ? (
                    <span>ACTIVE FORCE FIELD ⚠️</span>
                  ) : (
                    <span style={{ color: 'var(--neon-green)' }}>SOLVED / DISSOLVED ✓</span>
                  )}
                </div>
                {/* Hatched Danger Strip Line representing Force Field */}
                {TDZ_STEPS[tdzStep].scopeVars.myVar.status === 'tdz' ? (
                  <div className="tdz-barrier-line"></div>
                ) : (
                  <div style={{ height: '4px', background: 'rgba(57,255,20,0.2)', border: '1px solid rgba(57,255,20,0.4)', borderRadius: '2px' }}></div>
                )}
              </div>

              {/* Step info commentary */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '4px', marginTop: 'auto' }}>
                <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>ENGINE NARRATION</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '4px 0 0 0', textAlign: 'left' }}>
                  {TDZ_STEPS[tdzStep].comment}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MemorySim;
