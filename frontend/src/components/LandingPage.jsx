import React, { useState, useEffect, useRef } from 'react';
import { playSpaceSound } from '../utils/audio';

const LandingPage = ({ onStart }) => {
  const [facts, setFacts] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [illuminatedFact, setIlluminatedFact] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const containerRef = useRef(null);

  const handleLaunchClick = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    playSpaceSound('launch');
    setTimeout(() => {
      onStart();
    }, 2400); // 2.4s launch rumble, flight, star sweep & screen flash
  };

  // Position slots that are safely placed on the left and right sides
  // of the screen to prevent overlapping with the center card (which is 600px wide)
  const safePositions = [
    // Left side slots
    { left: '6%', top: '12%', width: '250px' },
    { left: '8%', top: '38%', width: '250px' },
    { left: '5%', top: '62%', width: '250px' },
    { left: '9%', top: '82%', width: '250px' },
    
    // Right side slots
    { right: '6%', top: '12%', width: '250px' },
    { right: '8%', top: '38%', width: '250px' },
    { right: '5%', top: '62%', width: '250px' },
    { right: '9%', top: '82%', width: '250px' }
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
          "CSS stands for Cascading Style Sheets. The 'cascading' refers to the order rules are applied.",
          "HTTP is stateless. Each request from a client is executed independently without prior context.",
          "Docker containerizes code, packaging it with all dependencies so it runs identically on any OS.",
          "Horizontal scaling adds more machines to a pool, while vertical scaling adds power (CPU/RAM) to one server.",
          "typeof null returns 'object' because of a 30-year-old bug in the initial JavaScript implementation.",
          "DNS (Domain Name System) acts as the phonebook of the internet, converting domain names to IP addresses.",
          "The first web page went live in 1991, hosted on a NeXT computer by Tim Berners-Lee at CERN."
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
      if (illuminatedFact !== facts[closestIndex]) {
        // play small beep when revealing a new fact
        playSpaceSound('click');
        setIlluminatedFact(facts[closestIndex]);
      }
    } else {
      setIlluminatedFact('');
    }
  };

  return (
    <div 
      className={`flashlight-container ${isLaunching ? 'scenic-zoom-in' : ''}`} 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: 'transparent',
        overflow: 'hidden'
      }}
    >

      {/* Background layer: Hidden texts positioned safely */}
      <div className="bg-facts-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
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

          // Alternate emojis for space vibes
          const spaceEmojis = ["🌌", "🚀", "🛰️", "🛸", "☄️", "🔭", "⭐", "🛰️"];
          const emoji = spaceEmojis[index % spaceEmojis.length];

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
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                color: isIlluminated ? `rgba(255, 255, 255, ${opacity})` : 'rgba(255, 255, 255, 0.02)',
                textShadow: isIlluminated ? `0 0 10px rgba(0, 210, 255, ${opacity * 0.8}), 0 0 20px rgba(110, 0, 255, ${opacity * 0.4})` : 'none',
                fontWeight: isIlluminated ? '600' : '400',
                transition: 'color 0.15s ease, text-shadow 0.15s ease',
                zIndex: isIlluminated ? 3 : 1,
                fontSize: '15px',
                lineHeight: '1.4'
              }}
            >
              {emoji} {fact}
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
          zIndex: -2,
          mixBlendMode: 'multiply',
          background: `radial-gradient(circle 220px at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 20%, rgba(0, 0, 0, 0.92) 80%, #000000 100%)`,
          pointerEvents: 'none'
        }}
      ></div>

      {/* Main Content Card (HUD Cockpit Styled) */}
      <div 
        className={`glass-card glow-animation hud-card ${isLaunching ? 'scenic-card-fade-out' : ''}`} 
        style={{ 
          zIndex: 10, 
          textAlign: 'center', 
          width: '90%',
          maxWidth: '560px', 
          padding: '40px 30px',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          background: 'rgba(5, 5, 8, 0.94)',
          boxShadow: '0 0 30px rgba(0, 210, 255, 0.08), inset 0 0 15px rgba(0, 210, 255, 0.04)',
          position: 'relative'
        }}
      >
        {/* Holographic Spinning Galaxy Graphic */}
        <div style={{ width: '75px', height: '75px', margin: '0 auto 15px auto' }}>
          <svg viewBox="0 0 100 100" className="svg-vortex-spin" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="galaxy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="50%" stopColor="#e600ff" />
                <stop offset="100%" stopColor="#6e00ff" />
              </linearGradient>
            </defs>
            <path d="M 50 50 C 65 30 75 40 85 50 C 95 60 70 70 50 50 Z" fill="url(#galaxy-grad)" opacity="0.4"/>
            <path d="M 50 50 C 35 70 25 60 15 50 C 5 40 30 30 50 50 Z" fill="url(#galaxy-grad)" opacity="0.4"/>
            <circle cx="50" cy="50" r="5" fill="#ffffff" filter="drop-shadow(0 0 5px #00d2ff)"/>
            <circle cx="28" cy="38" r="1.5" fill="#00d2ff"/>
            <circle cx="72" cy="62" r="1" fill="#e600ff"/>
            <circle cx="58" cy="28" r="1.2" fill="#ffffff"/>
            <circle cx="42" cy="72" r="1.2" fill="#6e00ff"/>
          </svg>
        </div>

        <h1 style={{ 
          fontSize: '44px', 
          letterSpacing: '5px', 
          textTransform: 'uppercase', 
          marginBottom: '8px', 
          color: '#fff',
          textShadow: '0 0 10px rgba(0,210,255,0.3)'
        }}>
          ThunderDev
        </h1>
        
        <p style={{ color: 'var(--neon-blue)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '8px' }}>
          Master Full-Stack Web Development & Systems
        </p>
        <p style={{ color: '#00d2ff', fontSize: '11px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontFamily: 'monospace' }}>
          &gt;_ Learning Web Dev by Gamified Space Theme
        </p>

        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          {illuminatedFact ? (
            <p style={{ color: '#fff', fontSize: '14px', fontStyle: 'italic', textShadow: '0 0 8px rgba(0, 210, 255, 0.6)', lineHeight: '1.4' }}>
              💡 {illuminatedFact}
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', opacity: 0.7 }}>
              Hover your mouse near the screen edges to scan web dev facts
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn-neon-blue" 
            onClick={handleLaunchClick} 
            onMouseEnter={() => !isLaunching && playSpaceSound('click')}
            disabled={isLaunching}
            style={{ 
              padding: '14px 40px', 
              fontSize: '16px',
              borderRadius: '4px',
              fontWeight: '700',
              letterSpacing: '2px',
              textShadow: '0 0 5px rgba(0,210,255,0.4)',
              boxShadow: '0 0 15px rgba(0,210,255,0.1)',
              opacity: isLaunching ? 0.6 : 1,
              cursor: isLaunching ? 'wait' : 'pointer'
            }}
          >
            {isLaunching ? 'LIFT-OFF INITIALIZED' : 'LAUNCH COMMAND CORE'}
          </button>
        </div>
      </div>

      {/* Calm shooting star scenic overlays */}
      {isLaunching && (
        <>
          <div className="scenic-star-container">
            {/* The main diagonal shooting star */}
            <div className="calming-shooting-star" />

            {/* Sparkle particles trailing the shooting star */}
            {Array.from({ length: 20 }).map((_, idx) => {
              // Position particles along the diagonal path from top-right to bottom-left
              const progress = idx / 20;
              const topVal = progress * 100;
              const leftVal = 100 - (progress * 115);
              const delay = progress * 1.3; // sparkles appear as the star sweeps
              return (
                <div
                  key={idx}
                  className="sparkle-particle"
                  style={{
                    top: `${topVal}%`,
                    left: `${leftVal}%`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Scenic Fade Out Overlay */}
          <div className="scenic-screen-flash" />
        </>
      )}
    </div>
  );
};

export default LandingPage;
