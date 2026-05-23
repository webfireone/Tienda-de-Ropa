// tests/play-counter-test.js

// --- Mock localStorage ---
const storage = {}
global.localStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, val) => { storage[key] = val },
  removeItem: (key) => { delete storage[key] },
}

// --- Test data ---
const MOCK_PLAYS_KEY = "glamours_mock_plays"
const MOCK_LIKES_KEY = "glamours_mock_likes"

// Re-implement core functions from useMusic.ts
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadMockCollection(key) {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveMockCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

function addMockPlay(play) {
  const plays = loadMockCollection(MOCK_PLAYS_KEY)
  plays.push(play)
  saveMockCollection(MOCK_PLAYS_KEY, plays)
}

function getCurrentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function isCurrentMonth(dateStr) {
  return dateStr.slice(0, 7) === getCurrentMonthKey()
}

// --- Tests ---
let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) {
    console.log(`  \u2713 ${msg}`)
    passed++
  } else {
    console.log(`  \u2717 ${msg}`)
    failed++
  }
}

function assertEqual(actual, expected, msg) {
  if (actual === expected) {
    console.log(`  \u2713 ${msg}`)
    passed++
  } else {
    console.log(`  \u2717 ${msg} \u2014 expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    failed++
  }
}

console.log("\n=== Play Counter Tests ===\n")

// --- Test 1: Save and load plays ---
console.log("1. Save and load plays:")
localStorage.removeItem(MOCK_PLAYS_KEY)

const play1 = { id: generateId(), cancionId: "song-1", usuarioId: null, fechaReproduccion: new Date().toISOString() }
addMockPlay(play1)

const plays = loadMockCollection(MOCK_PLAYS_KEY)
assertEqual(plays.length, 1, "1 play saved")
assertEqual(plays[0].cancionId, "song-1", "cancionId matches")

// --- Test 2: Multiple plays for same song ---
console.log("\n2. Multiple plays for same song:")
const play2 = { id: generateId(), cancionId: "song-1", usuarioId: null, fechaReproduccion: new Date().toISOString() }
addMockPlay(play2)

const playsAfter = loadMockCollection(MOCK_PLAYS_KEY)
assertEqual(playsAfter.length, 2, "2 plays total")

// --- Test 3: Monthly filtering ---
console.log("\n3. Monthly filtering:")
const playsList = loadMockCollection(MOCK_PLAYS_KEY)
const monthPlays = playsList.filter(p => isCurrentMonth(p.fechaReproduccion))
assertEqual(monthPlays.length, 2, "both plays are in current month")

// --- Test 4: Threshold logic ---
console.log("\n4. Threshold logic (>= 10 seconds):")
let lastRegisteredSong = ""
let playRegistered = false
function simulateTimeupdate(songId, currentTime) {
  if (currentTime >= 10 && lastRegisteredSong !== songId) {
    lastRegisteredSong = songId
    playRegistered = true
    addMockPlay({ id: generateId(), cancionId: songId, usuarioId: null, fechaReproduccion: new Date().toISOString() })
  }
}

// Simulate at 5 seconds — should NOT register
playRegistered = false
simulateTimeupdate("song-2", 5)
assertEqual(playRegistered, false, "at 5s: play NOT registered")
assertEqual(loadMockCollection(MOCK_PLAYS_KEY).length, 2, "still 2 plays")

// Simulate at 10 seconds — should register
playRegistered = false
simulateTimeupdate("song-2", 10)
assertEqual(playRegistered, true, "at 10s: play registered")
assertEqual(loadMockCollection(MOCK_PLAYS_KEY).length, 3, "3 plays now")

// Simulate at 15 seconds for same song — should NOT register duplicate
playRegistered = false
simulateTimeupdate("song-2", 15)
assertEqual(playRegistered, false, "at 15s: no duplicate")
assertEqual(loadMockCollection(MOCK_PLAYS_KEY).length, 3, "still 3 plays")

// Reset lastRegisteredSong (simulating playNewSong)
lastRegisteredSong = ""
playRegistered = false
simulateTimeupdate("song-2", 10)
assertEqual(playRegistered, true, "after reset: play registered again")
assertEqual(loadMockCollection(MOCK_PLAYS_KEY).length, 4, "4 plays now")

// --- Test 5: Like counting ---
console.log("\n5. Like toggle:")
const user1 = "user-abc"
function toggleLike(cancionId, usuarioId) {
  const likes = loadMockCollection(MOCK_LIKES_KEY)
  const existing = likes.find(l => l.cancionId === cancionId && l.usuarioId === usuarioId)
  if (existing) {
    const remaining = likes.filter(l => l.id !== existing.id)
    saveMockCollection(MOCK_LIKES_KEY, remaining)
    return false
  }
  const like = { id: `${cancionId}_${usuarioId}`, cancionId, usuarioId, fechaLike: new Date().toISOString() }
  likes.push(like)
  saveMockCollection(MOCK_LIKES_KEY, likes)
  return true
}

assertEqual(toggleLike("song-1", user1), true, "first like added")
assertEqual(loadMockCollection(MOCK_LIKES_KEY).length, 1, "1 like total")
assertEqual(toggleLike("song-1", user1), false, "toggle removes like")
assertEqual(loadMockCollection(MOCK_LIKES_KEY).length, 0, "0 likes")
assertEqual(toggleLike("song-1", user1), true, "re-added")
assertEqual(loadMockCollection(MOCK_LIKES_KEY).length, 1, "1 like")

// --- Test 6: Ranking calculation ---
console.log("\n6. Ranking calculation:")
localStorage.removeItem(MOCK_PLAYS_KEY)
localStorage.removeItem(MOCK_LIKES_KEY)

// Add 3 plays for song-1, 1 play for song-2
addMockPlay({ id: generateId(), cancionId: "song-1", usuarioId: null, fechaReproduccion: new Date().toISOString() })
addMockPlay({ id: generateId(), cancionId: "song-1", usuarioId: null, fechaReproduccion: new Date().toISOString() })
addMockPlay({ id: generateId(), cancionId: "song-1", usuarioId: null, fechaReproduccion: new Date().toISOString() })
addMockPlay({ id: generateId(), cancionId: "song-2", usuarioId: null, fechaReproduccion: new Date().toISOString() })

// Add 2 likes for song-1, 1 like for song-2
toggleLike("song-1", "user1")
toggleLike("song-1", "user2")
toggleLike("song-2", "user1")

const allPlays = loadMockCollection(MOCK_PLAYS_KEY)
const allLikes = loadMockCollection(MOCK_LIKES_KEY)

// Calculate ranking
const playsBySong = {}
allPlays.forEach(p => { playsBySong[p.cancionId] = (playsBySong[p.cancionId] || 0) + 1 })

const likesBySong = {}
allLikes.forEach(l => { likesBySong[l.cancionId] = (likesBySong[l.cancionId] || 0) + 1 })

console.log(`  song-1: ${playsBySong["song-1"]} plays, ${likesBySong["song-1"]} likes`)
console.log(`  song-2: ${playsBySong["song-2"]} plays, ${likesBySong["song-2"]} likes`)

assertEqual(playsBySong["song-1"], 3, "song-1 has 3 plays")
assertEqual(playsBySong["song-2"], 1, "song-2 has 1 play")
assertEqual(likesBySong["song-1"], 2, "song-1 has 2 likes")
assertEqual(likesBySong["song-2"], 1, "song-2 has 1 like")

// Score = likes * 2 + plays
const score1 = (likesBySong["song-1"] || 0) * 2 + (playsBySong["song-1"] || 0)
const score2 = (likesBySong["song-2"] || 0) * 2 + (playsBySong["song-2"] || 0)
assertEqual(score1, 7, "song-1 score = 7 (2*2 + 3)")
assertEqual(score2, 3, "song-2 score = 3 (1*2 + 1)")
assert(score1 > score2, "song-1 ranks higher than song-2")

// --- Summary ---
console.log(`\n${"=".repeat(40)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
