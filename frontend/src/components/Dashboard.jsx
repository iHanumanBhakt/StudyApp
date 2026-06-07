import React from 'react';

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

const BADGE_DESCS = {
  "Sandbox Safe": "Completed Day 1: Understood browser security, stack RAM requirements, and sandbox constraints.",
  "Memory Master": "Completed Day 2: Mastered Stack vs Heap memory allocation and hoisting behavior.",
  "Float Fixer": "Completed Day 3: Mastered type coercion logic and solved the floating-point precision bug.",
  "Loop Legend": "Completed Day 4: Programmed custom loops, generated bounded random numbers, and understood string immutability."
};

const Dashboard = ({ user, onSelectDay }) => {
  return (
    <div className="dashboard-grid">
      {/* Left panel: Learning path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Welcome back, {user.username}!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your JavaScript foundation course. Read daily theory, experiment with visual simulators, and solve coding challenges to earn badges.
          </p>
        </div>

        <h3 style={{ fontSize: '22px', borderBottom: '1px solid #222', paddingBottom: '10px', marginTop: '10px' }}>
          Your Learning Modules
        </h3>

        <div className="days-section">
          {DAYS_DATA.map((d) => {
            const isLocked = d.day > user.currentDay;
            return (
              <div 
                key={d.day}
                className={`glass-card day-card ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onSelectDay(d.day)}
              >
                <div className="day-card-number">0{d.day}</div>
                <h4 style={{ fontSize: '20px', marginBottom: '8px', color: isLocked ? 'var(--text-secondary)' : '#fff' }}>
                  Day {d.day}: {d.title}
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px', minHeight: '60px' }}>
                  {d.desc}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                Day {user.currentDay} of 4 unlocked
              </div>
            </div>
          </div>
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
