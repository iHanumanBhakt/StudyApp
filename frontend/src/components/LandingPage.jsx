import React, { useState, useEffect, useRef } from 'react';

const LandingPage = ({ onStart }) => {
  const [facts, setFacts] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [illuminatedFact, setIlluminatedFact] = useState('');
  const containerRef = useRef(null);

  // Position slots that are safely placed on the left and right sides
  // of the screen to prevent overlapping with the center card (which is 600px wide)
  const safePositions = [
    // Left side slots
    { left: '5%', top: '10%', width: '250px' },
    { left: '7%', top: '35%', width: '250px' },
    { left: '4%', top: '60%', width: '250px' },
    { left: '8%', top: '80%', width: '250px' },
    
    // Right side slots
    { right: '5%', top: '10%', width: '250px' },
    { right: '7%', top: '35%', width: '250px' },
    { right: '4%', top: '60%', width: '250px' },
    { right: '8%', top: '80%', width: '250px' }
  ];

  useEffect(() => {
    // Fetch facts from backend
    fetch('http://localhost:5000/api/facts')
      .then(res => res.json())
      .then(data => {
        setFacts(data.facts.slice(0, safePositions.length));
      })
      .catch(err => {
        console.error("Backend offline. Loading local facts.", err);
        const fallbackFacts = [
          "JavaScript was created in just 10 days in May 1995 by Brendan Eich at Netscape.",
          "Java and JavaScript are as related as 'Car' and 'Carpet'. The name was pure marketing!",
          "In 1995, consumer PCs had only 4MB to 8MB of RAM, making heavy runtimes impossible.",
          "Running raw C++ in the browser is a massive security hazard. It can read your drive or wipe data.",
          "JavaScript engines run inside a secure 'sandbox' to isolate code execution from the host OS.",
          "typeof null returns 'object'. This is a famous, 30-year-old bug in JavaScript.",
          "0.1 + 0.2 !== 0.3 because numbers are stored in binary IEEE-754 format.",
          "Strings in JavaScript are immutable. You cannot change a string in place; every operation returns a new one."
        ];
        setFacts(fallbackFacts);
      });
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Check if mouse is hovering close to any fact slot
    let closestIndex = -1;
    let minDistance = 20; // threshold radius percentage

    facts.forEach((_, idx) => {
      const pos = safePositions[idx];
      if (!pos) return;
      
      // Calculate coordinates in percentage
      let pX = 0;
      let pY = parseFloat(pos.top);
      if (pos.left) {
        pX = parseFloat(pos.left);
      } else {
        pX = 100 - parseFloat(pos.right);
      }

      const dist = Math.sqrt(Math.pow(pX - x, 2) + Math.pow(pY - y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    if (closestIndex !== -1 && facts[closestIndex]) {
      setIlluminatedFact(facts[closestIndex]);
    } else {
      setIlluminatedFact('');
    }
  };

  return (
    <div 
      className="flashlight-container" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: '#000000',
        overflow: 'hidden'
      }}
    >
      {/* Background layer: Hidden texts positioned safely */}
      <div className="bg-facts-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {facts.map((fact, index) => {
          const pos = safePositions[index];
          if (!pos) return null;

          // Calculate coordinates in percentage to compare with mouse position
          let pX = 0;
          let pY = parseFloat(pos.top);
          if (pos.left) {
            pX = parseFloat(pos.left);
          } else {
            pX = 100 - parseFloat(pos.right);
          }

          const distance = Math.sqrt(Math.pow(pX - mousePos.x, 2) + Math.pow(pY - mousePos.y, 2));
          // Higher range illumination spotlight (approx 22% of viewport width/height)
          const isIlluminated = distance < 22;
          // Calculate brightness based on distance
          const opacity = isIlluminated ? Math.max(0.05, 1 - (distance / 22)) : 0.01;

          return (
            <div 
              key={index} 
              className="fact-snippet"
              style={{
                position: 'absolute',
                left: pos.left || 'auto',
                right: pos.right || 'auto',
                top: pos.top,
                width: pos.width,
                whiteSpace: 'normal', /* Allow text wrapping so it is never cut off */
                wordBreak: 'break-word',
                color: isIlluminated ? `rgba(255, 255, 255, ${opacity})` : 'rgba(255, 255, 255, 0.02)',
                textShadow: isIlluminated ? `0 0 10px rgba(255, 255, 255, ${opacity * 0.8}), 0 0 20px rgba(255, 255, 255, ${opacity * 0.4})` : 'none',
                fontWeight: isIlluminated ? '600' : '400',
                transition: 'color 0.15s ease, text-shadow 0.15s ease',
                zIndex: isIlluminated ? 3 : 1,
                fontSize: '15px',
                lineHeight: '1.4'
              }}
            >
              ⚡ {fact}
            </div>
          );
        })}
      </div>

      {/* Radial Flashlight Overlay (larger radius, smooth fade) */}
      <div 
        className="flashlight-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          mixBlendMode: 'multiply',
          background: `radial-gradient(circle 220px at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 20%, rgba(0, 0, 0, 0.95) 90%, #000000 100%)`,
          pointerEvents: 'none'
        }}
      ></div>

      {/* Main Content Card */}
      <div 
        className="glass-card glow-animation" 
        style={{ 
          zIndex: 10, 
          textAlign: 'center', 
          width: '90%',
          maxWidth: '560px', 
          padding: '40px 30px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(5, 5, 5, 0.92)',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.05)'
        }}
      >
        <h1 style={{ fontSize: '42px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px', color: '#fff' }}>
          Thunder JS
        </h1>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px', fontFamily: 'monospace', letterSpacing: '1px' }}>
          // Master JavaScript Days 1 - 4 Interactively
        </p>

        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          {illuminatedFact ? (
            <p style={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace', textShadow: '0 0 6px #fff', lineHeight: '1.4' }}>
              💡 {illuminatedFact}
            </p>
          ) : (
            <p style={{ color: '#555', fontSize: '13px', fontFamily: 'monospace' }}>
              [Hover mouse cursor around the screen edges to reveal JS facts]
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn-neon" onClick={onStart} style={{ padding: '14px 40px', fontSize: '16px' }}>
            Enter Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
