import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import QuizArena from './components/QuizArena';
import DayModule from './components/DayModule';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'dashboard', 'quiz', 'learn'
  const [user, setUser] = useState(null); // { username, points, currentDay, badges, completedExercises }
  const [selectedDay, setSelectedDay] = useState(1);

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
        currentDay: Math.max(prev.currentDay, completedExercises.length >= prev.currentDay ? prev.currentDay + 1 : prev.currentDay)
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
      {/* Header bar - Hide on Landing screen */}
      {view !== 'landing' && (
        <header className="app-header">
          <div style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
            <span className="logo-text">⚡ Thunder JS</span>
            <div className="logo-sub">&gt;_ Day 1-4 Masterclass</div>
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
          onSelectDay={(dayNum) => {
            setSelectedDay(dayNum);
            setView('learn');
          }}
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
          onBack={() => setView('dashboard')}
          onUpdatePoints={handleUpdatePoints}
        />
      )}
    </div>
  );
}

export default App;
