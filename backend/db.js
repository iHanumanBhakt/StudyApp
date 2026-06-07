import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.resolve('database.json');

const INITIAL_MOCK_USERS = [
  {
    username: "AlexCoder",
    points: 420,
    currentDay: 4,
    completedExercises: ["day1_ex1", "day1_ex2", "day2_ex1", "day2_ex2", "day3_ex1", "day3_ex2", "day4_ex1"],
    badges: ["Sandbox Safe", "Memory Master", "Float Fixer"],
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    username: "Sarah_JS",
    points: 380,
    currentDay: 4,
    completedExercises: ["day1_ex1", "day1_ex2", "day2_ex1", "day2_ex2", "day3_ex1", "day4_ex1"],
    badges: ["Sandbox Safe", "Memory Master"],
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    username: "DevBhaiya",
    points: 250,
    currentDay: 3,
    completedExercises: ["day1_ex1", "day1_ex2", "day2_ex1", "day3_ex1"],
    badges: ["Sandbox Safe"],
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    username: "NoobDev",
    points: 90,
    currentDay: 2,
    completedExercises: ["day1_ex1", "day1_ex2"],
    badges: ["Sandbox Safe"],
    joinedAt: new Date().toISOString()
  }
];

async function initDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    // If database file doesn't exist, create it with initial data
    const initialData = {
      users: {},
      leaderboard: [...INITIAL_MOCK_USERS],
      submissions: []
    };
    await saveDb(initialData);
  }
}

async function getDb() {
  await initDb();
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function registerUser(username, password) {
  const db = await getDb();
  if (db.users[username.toLowerCase()]) {
    throw new Error('User already exists');
  }

  const newUser = {
    username,
    password, // Store plain for local demo simplicity, or simple hashing
    points: 0,
    currentDay: 1,
    completedExercises: [],
    badges: [],
    joinedAt: new Date().toISOString()
  };

  db.users[username.toLowerCase()] = newUser;
  
  // Also push to leaderboard list
  db.leaderboard.push({
    username,
    points: 0,
    currentDay: 1,
    completedExercises: [],
    badges: [],
    joinedAt: newUser.joinedAt
  });

  await saveDb(db);
  return { username: newUser.username, points: 0, currentDay: 1, badges: [], completedExercises: [] };
}

export async function loginUser(username, password) {
  const db = await getDb();
  const user = db.users[username.toLowerCase()];
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password');
  }
  return {
    username: user.username,
    points: user.points,
    currentDay: user.currentDay,
    badges: user.badges,
    completedExercises: user.completedExercises
  };
}

export async function getUserProfile(username) {
  const db = await getDb();
  const userKey = username.toLowerCase();
  if (!db.users[userKey]) {
    db.users[userKey] = {
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: new Date().toISOString()
    };
    db.leaderboard.push({
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: db.users[userKey].joinedAt
    });
    await saveDb(db);
  }
  return db.users[userKey];
}

export async function updateUserProgress(username, dayIndex) {
  const db = await getDb();
  const userKey = username.toLowerCase();
  
  if (!db.users[userKey]) {
    db.users[userKey] = {
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: new Date().toISOString()
    };
    db.leaderboard.push({
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: db.users[userKey].joinedAt
    });
  }

  if (dayIndex > db.users[userKey].currentDay) {
    db.users[userKey].currentDay = dayIndex;
    
    const leaderIndex = db.leaderboard.findIndex(l => l.username.toLowerCase() === userKey);
    if (leaderIndex !== -1) {
      db.leaderboard[leaderIndex].currentDay = dayIndex;
    }
  }
  await saveDb(db);
  return db.users[userKey];
}

export async function submitExercise(username, dayKey, exerciseIndex, code, pointsEarned) {
  const db = await getDb();
  const userKey = username.toLowerCase();
  
  if (!db.users[userKey]) {
    db.users[userKey] = {
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: new Date().toISOString()
    };
    db.leaderboard.push({
      username,
      points: 0,
      currentDay: 1,
      completedExercises: [],
      badges: [],
      joinedAt: db.users[userKey].joinedAt
    });
  }

  const user = db.users[userKey];
  const exerciseId = `${dayKey}_ex${exerciseIndex}`;

  const isAlreadyCompleted = user.completedExercises.includes(exerciseId);
  if (!isAlreadyCompleted) {
    user.completedExercises.push(exerciseId);
    user.points += pointsEarned;

    const newBadges = [];
    if (user.completedExercises.includes("day1_ex1") && !user.badges.includes("Sandbox Safe")) {
      newBadges.push("Sandbox Safe");
    }
    if (user.completedExercises.includes("day2_ex1") && !user.badges.includes("Memory Master")) {
      newBadges.push("Memory Master");
    }
    if (user.completedExercises.includes("day3_ex1") && !user.badges.includes("Float Fixer")) {
      newBadges.push("Float Fixer");
    }
    if (user.completedExercises.includes("day4_ex1") && !user.badges.includes("Loop Legend")) {
      newBadges.push("Loop Legend");
    }

    if (newBadges.length > 0) {
      user.badges = [...user.badges, ...newBadges];
    }

    const leaderIndex = db.leaderboard.findIndex(l => l.username.toLowerCase() === userKey);
    if (leaderIndex !== -1) {
      db.leaderboard[leaderIndex].points = user.points;
      db.leaderboard[leaderIndex].completedExercises = user.completedExercises;
      db.leaderboard[leaderIndex].badges = user.badges;
    }

    db.submissions.push({
      username,
      exerciseId,
      code,
      timestamp: new Date().toISOString()
    });

    await saveDb(db);
  }

  return {
    points: user.points,
    badges: user.badges,
    completedExercises: user.completedExercises
  };
}


export async function getLeaderboard() {
  const db = await getDb();
  // Sort by points descending
  return db.leaderboard.sort((a, b) => b.points - a.points);
}
