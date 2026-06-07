import React, { useState, useRef } from 'react';
import { playSpaceSound } from '../utils/audio';

const BADGE_DESCS = {
  "Sandbox Safe": "Completed Day 1: Understood browser security, stack RAM requirements, and sandbox constraints.",
  "Memory Master": "Completed Day 2: Mastered Stack vs Heap memory allocation and hoisting behavior.",
  "Float Fixer": "Completed Day 3: Mastered type coercion logic and solved the floating-point precision bug.",
  "Loop Legend": "Completed Day 4: Programmed custom loops, generated bounded random numbers, and understood string immutability."
};

const MODULES_DATA = [
  {
    id: 'js-foundation',
    title: 'JS Foundation',
    desc: 'Master browser sandboxing, stack vs heap memory referencing, coercion trees, floating-point precision, and loops.',
    status: 'Active Path',
    theme: 'theme-js',
    requirements: null,
    isLocked: false,
    graphic: (
      <svg viewBox="0 0 100 100" className="svg-float" style={{ width: '100%', height: '100%' }}>
        <path d="M 10 90 L 90 90 M 20 90 L 30 70 L 70 70 L 80 90 M 35 70 L 35 50 M 65 70 L 65 50" stroke="#00d2ff" strokeWidth="1.5" fill="none" opacity="0.3"/>
        <path className="svg-fire" d="M 45 68 L 50 82 L 55 68 Z" fill="#ff7700" opacity="0.9"/>
        <path className="svg-fire" d="M 47 68 L 50 78 L 53 68 Z" fill="#ffdd00"/>
        <path d="M 50 20 C 47 35 44 55 42 68 L 58 68 C 56 55 53 35 50 20 Z" fill="#ffffff" stroke="#00d2ff" strokeWidth="1.5"/>
        <path d="M 42 55 L 30 68 L 42 68 Z M 58 55 L 70 68 L 58 68 Z" fill="#00d2ff" stroke="#00d2ff" strokeWidth="1" opacity="0.8"/>
        <path d="M 50 20 C 49 25 48 30 47 32 L 53 32 C 52 30 51 25 50 20 Z" fill="#00d2ff"/>
        <polygon points="49,38 51,38 52,42 48,42" fill="#0c0c0e" stroke="#00d2ff" strokeWidth="0.5"/>
      </svg>
    )
  },
  {
    id: 'backend-mastery',
    title: 'Backend Mastery',
    desc: 'Construct secure Express REST APIs, build robust routing layers, establish data validation middleware, and log server events.',
    status: 'Locked',
    theme: 'theme-backend',
    requirements: 'Requires: 500 XP & JS Foundation Badges',
    isLocked: true,
    graphic: (
      <svg viewBox="0 0 100 100" className="svg-float" style={{ width: '100%', height: '100%' }}>
        <circle cx="20" cy="30" r="1.5" fill="#ff4500" opacity="0.4"/>
        <circle cx="80" cy="20" r="1" fill="#ff4500" opacity="0.6"/>
        <circle cx="15" cy="70" r="2" fill="#ff4500" opacity="0.3"/>
        <circle cx="85" cy="75" r="1.5" fill="#ff4500" opacity="0.5"/>
        <path className="svg-fire" d="M 42 70 L 50 92 L 58 70 Z" fill="#ff3c00"/>
        <path className="svg-fire" d="M 46 70 L 50 85 L 54 70 Z" fill="#ffb700"/>
        <rect x="44" y="30" width="12" height="40" rx="6" fill="#ffffff" stroke="#ff4500" strokeWidth="1.5"/>
        <path d="M 44 32 C 44 20 56 20 56 32 Z" fill="#ff4500"/>
        <path d="M 40 50 L 44 48 L 44 70 L 40 70 Z" fill="#b0b0b5" stroke="#ff4500" strokeWidth="1"/>
        <path d="M 60 50 L 56 48 L 56 70 L 60 70 Z" fill="#b0b0b5" stroke="#ff4500" strokeWidth="1"/>
        <circle cx="50" cy="45" r="3" fill="#050505" stroke="#ff4500" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'frontend-mastery',
    title: 'Frontend Mastery',
    desc: 'Master React state engines, visual data structures, complex animation curves, drag resize event loops, and fluid CSS grids.',
    status: 'Locked',
    theme: 'theme-frontend',
    requirements: 'Requires: 1000 XP & Backend Mastery',
    isLocked: true,
    graphic: (
      <svg viewBox="0 0 100 100" className="svg-float" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#e600ff" strokeWidth="1.5" strokeDasharray="3 3"/>
        <path d="M 20 55 C 20 20 80 20 80 55 C 80 65 72 78 50 78 C 28 78 20 65 20 55 Z" fill="#120c18" stroke="#e600ff" strokeWidth="2"/>
        <rect x="25" y="35" width="14" height="10" rx="1" fill="none" stroke="#00d2ff" strokeWidth="0.8" opacity="0.7"/>
        <line x1="28" y1="38" x2="36" y2="38" stroke="#00d2ff" strokeWidth="0.8" opacity="0.7"/>
        <line x1="28" y1="41" x2="33" y2="41" stroke="#00d2ff" strokeWidth="0.8" opacity="0.7"/>
        <rect x="61" y="35" width="14" height="12" rx="1" fill="none" stroke="#e600ff" strokeWidth="0.8" opacity="0.7"/>
        <circle cx="68" cy="41" r="2" fill="none" stroke="#e600ff" strokeWidth="0.8" opacity="0.7"/>
        <circle cx="50" cy="50" r="14" fill="none" stroke="#e600ff" strokeWidth="1" opacity="0.8"/>
        <circle cx="50" cy="50" r="18" fill="none" stroke="#00d2ff" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.6"/>
      </svg>
    )
  },
  {
    id: 'system-design',
    title: 'System Design',
    desc: 'Architect distributed systems, partition database rings, configure horizontal layers, build rate limiters and queues.',
    status: 'Locked',
    theme: 'theme-sysdesign',
    requirements: 'Requires: 1500 XP & Frontend Mastery',
    isLocked: true,
    graphic: (
      <svg viewBox="0 0 100 100" className="svg-float" style={{ width: '100%', height: '100%' }}>
        <line x1="15" y1="15" x2="35" y2="25" stroke="#39ff14" strokeWidth="0.5" opacity="0.3"/>
        <line x1="35" y1="25" x2="50" y2="15" stroke="#39ff14" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="15" x2="80" y2="30" stroke="#39ff14" strokeWidth="0.5" opacity="0.3"/>
        <circle cx="15" cy="15" r="1.5" fill="#39ff14" opacity="0.4"/>
        <circle cx="35" cy="25" r="2" fill="#39ff14" opacity="0.5"/>
        <circle cx="50" cy="15" r="1.5" fill="#39ff14" opacity="0.4"/>
        <circle cx="80" cy="30" r="2" fill="#39ff14" opacity="0.6"/>
        <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#39ff14" strokeWidth="1.5"/>
        <g className="svg-station-rotate">
          <circle cx="50" cy="50" r="26" fill="none" stroke="#39ff14" strokeWidth="1" strokeDasharray="10 5" opacity="0.8"/>
          <rect x="18" y="47" width="12" height="6" fill="#0c0c0e" stroke="#39ff14" strokeWidth="1"/>
          <rect x="70" y="47" width="12" height="6" fill="#0c0c0e" stroke="#39ff14" strokeWidth="1"/>
          <rect x="47" y="18" width="6" height="12" fill="#0c0c0e" stroke="#39ff14" strokeWidth="1"/>
          <rect x="47" y="70" width="6" height="12" fill="#0c0c0e" stroke="#39ff14" strokeWidth="1"/>
        </g>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#39ff14" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    )
  },
  {
    id: 'devops-module',
    title: 'DevOps Academy',
    desc: 'Assemble CI/CD automation pipelines, package apps with Docker, orchestrate nodes, and manage logging infrastructure.',
    status: 'Locked',
    theme: 'theme-devops',
    requirements: 'Requires: 2000 XP & System Design',
    isLocked: true,
    graphic: (
      <svg viewBox="0 0 100 100" className="svg-float" style={{ width: '100%', height: '100%' }}>
        <g className="svg-vortex-spin">
          <path d="M 50 15 C 30 15 15 30 15 50 C 15 70 30 85 50 85 C 70 85 85 70 85 50" stroke="#6e00ff" strokeWidth="1.5" fill="none" strokeDasharray="30 15 10" opacity="0.6"/>
          <path d="M 50 25 C 36 25 25 36 25 50 C 25 64 36 75 50 75 C 64 75 75 64 75 50" stroke="#00d2ff" strokeWidth="1.2" fill="none" strokeDasharray="20 10 5" opacity="0.8"/>
          <path d="M 50 35 C 41 35 35 41 35 50 C 35 59 41 65 50 65 C 59 65 65 59 65 50" stroke="#6e00ff" strokeWidth="2" fill="none" strokeDasharray="15 5" opacity="0.9"/>
        </g>
        <circle cx="50" cy="50" r="8" fill="#050505" stroke="#6e00ff" strokeWidth="2"/>
        <g className="svg-orbit-rotate">
          <g transform="translate(18, 18) rotate(45)">
            <rect x="-4" y="-3" width="8" height="6" fill="#ffffff" stroke="#6e00ff" strokeWidth="1"/>
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#00d2ff" strokeWidth="1.2"/>
            <rect x="-10" y="-2" width="4" height="4" fill="#0c0c0e" stroke="#00d2ff" strokeWidth="0.5"/>
            <rect x="6" y="-2" width="4" height="4" fill="#0c0c0e" stroke="#00d2ff" strokeWidth="0.5"/>
            <circle cx="0" cy="5" r="1.5" fill="#6e00ff"/>
          </g>
        </g>
      </svg>
    )
  }
];

const Dashboard = ({ user, onSelectModule }) => {
  const [scanningCardId, setScanningCardId] = useState(null);
  const [selectedDayNum, setSelectedDayNum] = useState(1);
  const [flashcards, setFlashcards] = useState([]);
  const scanTimeoutRef = useRef(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);

  const handleLoadFlashcards = (dayNum) => {
    setCardsLoading(true);
    setIsFlipped(false);
    setCurrentCardIdx(0);
    setFlashcards([]);
    
    fetch('http://localhost:5000/api/ai/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day: dayNum })
    })
    .then(res => res.json())
    .then(data => {
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      }
      setCardsLoading(false);
    })
    .catch(err => {
      console.error("Failed to load flashcards:", err);
      setCardsLoading(false);
    });
  };

  const getDynamicLockStatus = (moduleId) => {
    const hasAllJsBadges = ["Sandbox Safe", "Memory Master", "Float Fixer", "Loop Legend"].every(b => user.badges?.includes(b));
    
    switch (moduleId) {
      case 'js-foundation':
        return false;
      case 'backend-mastery':
        return !(user.points >= 500 && hasAllJsBadges);
      case 'frontend-mastery':
        return !(user.points >= 1000);
      case 'system-design':
        return !(user.points >= 1500);
      case 'devops-module':
        return !(user.points >= 2000);
      default:
        return true;
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const handleModuleClick = (m) => {
    const isLocked = getDynamicLockStatus(m.id);
    if (isLocked) {
      playSpaceSound('denied');
      setScanningCardId(m.id);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      scanTimeoutRef.current = setTimeout(() => {
        setScanningCardId(null);
        scanTimeoutRef.current = null;
      }, 2500);
    } else {
      onSelectModule(m.id);
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Left panel: Learning path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome back, {user.username}!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your space station launchpad. Read theory, experiment with visual 3D flight simulators, and pass missions to unlock advanced cosmic pathways.
          </p>
        </div>

        <h3 style={{ fontSize: '22px', borderBottom: '1px solid #222', paddingBottom: '10px', marginTop: '10px' }}>
          Explore Specializations
        </h3>

        <div className="pathways-grid">
          {MODULES_DATA.map((m) => {
            const isScanning = scanningCardId === m.id;
            const isLocked = getDynamicLockStatus(m.id);
            return (
              <div
                key={m.id}
                className={`pathway-card ${m.theme} ${isLocked ? 'locked' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleModuleClick(m)}
              >
                <div className="pathway-bg-glow"></div>
                
                <div className="pathway-card-graphic">
                  {m.graphic}
                </div>
                
                <div className="pathway-card-title">{m.title}</div>
                <div className="pathway-card-desc">{m.desc}</div>
                
                <div 
                  className="pathway-card-status" 
                  style={{
                    color: isLocked ? 'var(--neon-red)' : 'var(--neon-blue)',
                    borderColor: isLocked ? 'rgba(255,0,85,0.2)' : 'rgba(0,210,255,0.2)'
                  }}
                >
                  {isLocked ? '🔒 Locked' : '🚀 Open'}
                </div>

                {isScanning && (
                  <div className="hud-scan-overlay">
                    <div className="hud-scanline"></div>
                    <div className="hud-lock-icon">🔒</div>
                    <div className="hud-locked-text">Access Denied</div>
                    <div className="hud-requirements">{m.requirements}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Profile Stats & Leaderboard snapshot */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--neon-green)' }}>
          <h3 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
            Student Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score Points</div>
              <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--neon-green)', textShadow: '0 0 10px var(--neon-green-glow)' }}>
                {user.points} XP
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class Progress</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {user.currentDay > 4 || user.completedExercises?.length >= 4 ? "All Days Completed! 🎉" : `Day ${user.currentDay} of 4 unlocked`}
              </div>
            </div>
          </div>
        </div>

        {/* AI STUDY DECK WIDGET */}
        <div className="glass-card ai-flashcard-deck">
          <h3 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧠</span> AI Study Deck
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
            Review core concepts with flippable flashcards generated on the fly.
          </p>
          
          {/* Day selection tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
            {[1, 2, 3, 4].map(dNum => {
              const isDayLocked = dNum > user.currentDay;
              const isSelected = selectedDayNum === dNum;
              return (
                <button
                  key={dNum}
                  onClick={() => {
                    if (!isDayLocked) {
                      setSelectedDayNum(dNum);
                      setFlashcards([]);
                    }
                  }}
                  disabled={isDayLocked}
                  className={`btn-neon ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    opacity: isDayLocked ? 0.3 : 1,
                    cursor: isDayLocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  Day 0{dNum} {isDayLocked && '🔒'}
                </button>
              );
            })}
          </div>

          {cardsLoading ? (
            <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px' }}>
              <span className="spinner" style={{ fontSize: '24px', display: 'inline-block' }}>🌀</span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--neon-blue)' }}>Synthesizing flashcards...</span>
            </div>
          ) : flashcards.length > 0 ? (
            <div>
              {/* Flippable Card Container */}
              <div 
                className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  height: '180px',
                  perspective: '1000px',
                  cursor: 'pointer',
                  position: 'relative',
                  marginBottom: '15px'
                }}
              >
                <div 
                  className="flashcard-inner"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none'
                  }}
                >
                  {/* Front Face */}
                  <div 
                    className="flashcard-front"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      boxShadow: 'inset 0 0 10px rgba(0,210,255,0.05)'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'monospace' }}>Question</span>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>
                      {flashcards[currentCardIdx]?.question}
                    </p>
                    <span style={{ fontSize: '10px', color: '#444', marginTop: '15px' }}>[Click to flip]</span>
                  </div>

                  {/* Back Face */}
                  <div 
                    className="flashcard-back"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      background: 'rgba(0,210,255,0.03)',
                      border: '1px solid rgba(0,210,255,0.2)',
                      borderRadius: '8px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      transform: 'rotateY(180deg)',
                      boxShadow: '0 0 15px rgba(0,210,255,0.05)'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--neon-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'monospace' }}>Answer</span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#e4e4e7', textAlign: 'center', lineHeight: '1.4' }}>
                      {flashcards[currentCardIdx]?.answer}
                    </p>
                    <span style={{ fontSize: '10px', color: '#444', marginTop: '15px' }}>[Click to flip back]</span>
                  </div>
                </div>
              </div>

              {/* Navigation controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-neon"
                  disabled={currentCardIdx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                    setTimeout(() => setCurrentCardIdx(prev => prev - 1), 150);
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', opacity: currentCardIdx === 0 ? 0.3 : 1 }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  Card {currentCardIdx + 1} of {flashcards.length}
                </span>
                <button
                  className="btn-neon"
                  disabled={currentCardIdx === flashcards.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                    setTimeout(() => setCurrentCardIdx(prev => prev + 1), 150);
                  }}
                  style={{ padding: '4px 10px', fontSize: '11px', opacity: currentCardIdx === flashcards.length - 1 ? 0.3 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button 
                className="btn-neon-blue"
                onClick={() => handleLoadFlashcards(selectedDayNum)}
                style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🧠 Generate Flashcards
              </button>
            </div>
          )}
        </div>


        <div className="glass-card">
          <h3 style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Earned Badges
          </h3>
          {user.badges && user.badges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {user.badges.map((badge, idx) => (
                <div key={idx} className={`badge-item ${badge === 'Sandbox Safe' ? 'safe' : badge === 'Float Fixer' ? 'fixer' : ''}`} title={BADGE_DESCS[badge]}>
                  <span>🏆</span>
                  <div>
                    <div style={{ fontWeight: '700' }}>{badge}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '400', marginTop: '2px' }}>
                      {BADGE_DESCS[badge]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontStyle: 'italic' }}>
              No badges earned yet. Complete coding exercises inside Day modules to unlock achievements!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
