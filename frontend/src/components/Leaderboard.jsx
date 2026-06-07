import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const Leaderboard = ({ currentUser }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend offline. Loading local leaderboard fallback.", err);
        // Fallback list
        const fallbackList = [
          { username: "AlexCoder", points: 420, currentDay: 4, completedCount: 7, badges: ["Sandbox Safe", "Memory Master", "Float Fixer"] },
          { username: "Sarah_JS", points: 380, currentDay: 4, completedCount: 6, badges: ["Sandbox Safe", "Memory Master"] },
          { username: "DevBhaiya", points: 250, currentDay: 3, completedCount: 4, badges: ["Sandbox Safe"] },
          { username: currentUser?.username || "You", points: currentUser?.points || 0, currentDay: currentUser?.currentDay || 1, completedCount: currentUser?.completedExercises?.length || 0, badges: currentUser?.badges || [] },
          { username: "NoobDev", points: 90, currentDay: 2, completedCount: 2, badges: ["Sandbox Safe"] }
        ];
        // Sort
        fallbackList.sort((a, b) => b.points - a.points);
        setList(fallbackList);
        setLoading(false);
      });
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>⚡ Compiling Leaderboard Data...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="glass-card">
        <h2 style={{ fontSize: '30px', marginBottom: '8px' }}>Leaderboard rankings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
          Compare your scores with other students in the class. Solve challenges on the platform to climb the ladder!
        </p>

        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Rank</th>
              <th>Student</th>
              <th>Progress</th>
              <th>Badges</th>
              <th style={{ textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {list.map((player, idx) => {
              const isSelf = currentUser && player.username.toLowerCase() === currentUser.username.toLowerCase();
              const rank = idx + 1;
              let rankClass = "";
              if (rank === 1) rankClass = "rank-1";
              else if (rank === 2) rankClass = "rank-2";
              else if (rank === 3) rankClass = "rank-3";

              return (
                <tr key={idx} className={`leaderboard-row ${isSelf ? 'current-user' : ''} ${rankClass}`}>
                  <td>
                    <span className="rank-badge">{rank}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', fontSize: '16px' }}>
                        {player.username} {isSelf ? ' (You)' : ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                      {player.currentDay > 4 || player.completedCount >= 4 ? "Completed 🎉" : `Day ${player.currentDay}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {player.badges && player.badges.map((b, bIdx) => (
                        <span 
                          key={bIdx} 
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            background: b === 'Sandbox Safe' ? 'rgba(57,255,20,0.08)' : 'rgba(0,210,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            color: b === 'Sandbox Safe' ? 'var(--neon-green)' : 'var(--neon-blue)',
                            fontWeight: '600'
                          }}
                        >
                          {b}
                        </span>
                      ))}
                      {(!player.badges || player.badges.length === 0) && (
                        <span style={{ color: '#444', fontSize: '12px' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--neon-green)' }}>
                    {player.points} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
