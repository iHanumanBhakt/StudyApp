import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import QuizArena from './components/QuizArena';
import DayModule from './components/DayModule';
import JsPathPage from './components/JsPathPage';
import { playSpaceSound } from './utils/audio';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'js-path', 'quiz', 'learn'
  const [user, setUser] = useState(null); // { username, points, currentDay, badges, completedExercises }
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedDayTab, setSelectedDayTab] = useState('theory');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingView, setPendingView] = useState('');

  const triggerWarpTransition = (targetView) => {
    setIsTransitioning(true);
    setPendingView(targetView);
  };

  const handleWarpComplete = () => {
    setView(pendingView);
    setIsTransitioning(false);
    setPendingView('');
  };

  // Initialize or fetch Guest Student data on start
  const handleStart = () => {
    const saved = localStorage.getItem('thunderjs_user');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      const defaultUser = {
        username: "GuestCoder",
        points: 0,
        currentDay: 1,
        badges: [],
        completedExercises: []
      };
      setUser(defaultUser);
      localStorage.setItem('thunderjs_user', JSON.stringify(defaultUser));
    }
    setView('dashboard');
  };

  const handleUpdatePoints = (points, badges, completedExercises) => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        points,
        badges: badges || prev.badges,
        completedExercises: completedExercises || prev.completedExercises,
        currentDay: Math.min(5, Math.max(prev.currentDay, completedExercises.length >= prev.currentDay ? prev.currentDay + 1 : prev.currentDay))
      };
      localStorage.setItem('thunderjs_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleResetProgress = () => {
    const freshUser = {
      username: "GuestCoder",
      points: 0,
      currentDay: 1,
      badges: [],
      completedExercises: []
    };
    setUser(freshUser);
    localStorage.setItem('thunderjs_user', JSON.stringify(freshUser));
    setView('dashboard');
  };

  return (
    <div className="app-container">
      <SpaceBackground />
      {/* Header bar - Hide on Landing screen */}
      {view !== 'landing' && (
        <header className="app-header">
          <div style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
            <span className="logo-text">⚡ ThunderDev</span>
            <div className="logo-sub">&gt;_ Full-Stack & Systems Masterclass</div>
          </div>

          {user && (
            <div className="nav-links">
              <span 
                className={`nav-link ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </span>
              <span 
                className={`nav-link ${view === 'quiz' ? 'active' : ''}`}
                onClick={() => setView('quiz')}
              >
                Quiz Arena
              </span>
              <div className="user-info-badge">
                <span>👤 {user.username}</span>
                <span className="user-points">{user.points} XP</span>
              </div>
              <button 
                className="btn-neon" 
                onClick={handleResetProgress}
                style={{ padding: '6px 14px', fontSize: '12px' }}
                title="Wipe points and start fresh"
              >
                Reset Progress
              </button>
            </div>
          )}
        </header>
      )}

      {/* Landing View */}
      {view === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}

      {/* Main Dashboard view */}
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onSelectModule={(moduleId) => {
            if (moduleId === 'js-foundation') {
              triggerWarpTransition('js-path');
            }
          }}
        />
      )}

      {/* JS Path view */}
      {view === 'js-path' && user && (
        <JsPathPage
          user={user}
          onSelectDay={(dayNum, tabName = 'theory') => {
            setSelectedDay(dayNum);
            setSelectedDayTab(tabName);
            setView('learn');
          }}
          onBack={() => setView('dashboard')}
        />
      )}

      {/* Quiz Arena view */}
      {view === 'quiz' && user && (
        <QuizArena />
      )}

      {/* Learn Module view */}
      {view === 'learn' && user && (
        <DayModule 
          day={selectedDay}
          user={user}
          initialTab={selectedDayTab}
          onBack={() => setView('js-path')}
          onUpdatePoints={handleUpdatePoints}
        />
      )}

      {/* Hyperdrive transition overlay */}
      {isTransitioning && (
        <WarpTransition onComplete={handleWarpComplete} />
      )}
    </div>
  );
}

const WarpTransition = ({ onComplete }) => {
  // Generate 40 star streaks with random angles, durations, and delays
  const stars = Array.from({ length: 40 }).map((_, i) => {
    const angle = Math.random() * 360;
    const delay = Math.random() * 0.35;
    const duration = 0.5 + Math.random() * 0.45;
    return { id: i, angle, delay, duration };
  });

  useEffect(() => {
    const timer = setTimeout(onComplete, 1150);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="warp-overlay">
      <div className="warp-tunnel">
        <div className="warp-hud">
          <div className="warp-hud-text">ENGAGING HYPERDRIVE</div>
          <div className="warp-hud-dest">LOADING: JS FOUNDATION COMMAND CORE</div>
        </div>
        {stars.map(star => (
          <div
            key={star.id}
            className="star-streak"
            style={{
              left: '50%',
              top: '50%',
              '--angle': `${star.angle}deg`,
              transform: `translate(-50%, -50%) rotate(${star.angle}deg)`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SpaceBackground = () => {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    // Generate 70 stars with random positions, sizes, twinkling delays
    const generatedStars = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`
    }));
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStar = {
        id: Date.now(),
        top: `${Math.random() * 35}%`, // Start in top portion
        left: `${60 + Math.random() * 30}%`, // Start on the right side
        duration: `${1.2 + Math.random() * 1}s`
      };
      setShootingStars(prev => [...prev.slice(-2), newStar]); // Keep at most 3 active stars
    }, 4500); // Every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-background">
      {/* Twinkling star field */}
      {stars.map((star) => (
        <div 
          key={star.id} 
          className="twinkling-star"
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: '#ffffff',
            borderRadius: '50%',
            opacity: 0.3,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <div 
          key={star.id} 
          className="shooting-star"
          style={{
            top: star.top,
            left: star.left,
            width: '120px',
            animationDuration: star.duration
          }}
        />
      ))}
    </div>
  );
};

export default App;
