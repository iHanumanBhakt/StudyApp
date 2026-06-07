import React, { useEffect } from 'react';
import { playSpaceSound } from '../utils/audio';

const DAYS_DATA = [
  {
    day: 1,
    title: "The Birth of JS & Browser Sandboxing",
    desc: "Why Brendan Eich built JS in 10 days, why C++ is a security hazard in browsers, and how sandboxing keeps your computer safe.",
    topics: ["Netscape War 1995", "C++ System Call Dangers", "Sandboxing & Memory Safety"]
  },
  {
    day: 2,
    title: "Stack, Heap, Scopes & Data Types",
    desc: "Understand where JS values are stored in computer memory. Master let, const, var, and the Temporal Dead Zone.",
    topics: ["Stack vs Heap reference", "var vs let vs const", "Primitive vs Object mutability"]
  },
  {
    day: 3,
    title: "Operators, Coercion & Floating Inaccuracy",
    desc: "Deep dive into comparison rules (== vs ===). Learn why 0.1 + 0.2 equals 0.30000000000000004 and how to solve it.",
    topics: ["Loose vs Strict Equality", "Binary Truncation (IEEE-754)", "Implicit vs Explicit Coercion"]
  },
  {
    day: 4,
    title: "Control Flow, Loops, Math & Strings",
    desc: "Write clean decision chains and loops without crashing browsers. Learn the Math.random scaling formula and String immutability.",
    topics: ["for / while / do-while loops", "Math.random() range shifting", "String index & Immutability"]
  }
];

const JsPathPage = ({ user, onSelectDay, onBack }) => {
  useEffect(() => {
    // Play subtle click sound on page enter
    playSpaceSound('click');
  }, []);

  return (
    <div className="js-path-container anim-fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header breadcrumb & back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neon-blue)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            System Core / Specialization Pathway
          </div>
          <h2 style={{ fontSize: '36px', color: '#fff', fontWeight: '800', marginTop: '5px' }}>
            JavaScript Foundation
          </h2>
        </div>
        <button 
          className="btn-neon" 
          onClick={() => {
            playSpaceSound('click');
            onBack();
          }}
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          ← FLEET CONTROL
        </button>
      </div>

      {/* Path overview info */}
      <div className="glass-card" style={{ marginBottom: '40px', borderLeft: '3px solid var(--neon-blue)', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Mission Parameters
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
          Welcome to the JS Propulsion Core. To complete this specialization, you must master the fundamental layers of execution, scope, and basic syntax. Read the theory, interact with our simulators (Stack/Heap, Coercion, and V8 engines), and pass coding exams inside each module.
        </p>
      </div>

      {/* Day Cards list */}
      <h3 style={{ fontSize: '20px', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '24px' }}>
        Active Missions (Days 1 - 4)
      </h3>

      <div className="days-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        {DAYS_DATA.map((d) => {
          const isLocked = d.day > user.currentDay;
          return (
            <div 
              key={d.day}
              className={`glass-card day-card ${isLocked ? 'locked' : ''}`}
              onClick={() => {
                if (isLocked) {
                  playSpaceSound('denied');
                } else {
                  playSpaceSound('click');
                  onSelectDay(d.day, 'theory');
                }
              }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '30px'
              }}
            >
              <div className="day-card-number" style={{ fontSize: '72px', color: 'rgba(0, 210, 255, 0.03)' }}>
                0{d.day}
              </div>
              
              <div>
                <h4 style={{ fontSize: '22px', marginBottom: '10px', color: isLocked ? 'var(--text-secondary)' : '#fff' }}>
                  Day {d.day}: {d.title}
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', minHeight: '60px', lineHeight: '1.5' }}>
                  {d.desc}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                {d.topics.map((t, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(0, 210, 255, 0.05)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      color: isLocked ? '#555' : 'var(--neon-blue)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {isLocked && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5, 5, 8, 0.85)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'var(--neon-red)',
                  padding: '20px',
                  textAlign: 'center',
                  zIndex: 5
                }}>
                  <span style={{ fontSize: '32px', marginBottom: '10px', display: 'block', animation: 'pulseLock 1s infinite alternate' }}>🔒</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--neon-red)' }}>
                    Mission Locked
                  </div>
                  <div style={{ fontSize: '11px', color: '#a0a0a5', fontFamily: 'monospace', lineHeight: '1.5', maxWidth: '210px' }}>
                    Pass the Day {d.day - 1} coding test inside the compiler core to unlock this mission.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JsPathPage;
