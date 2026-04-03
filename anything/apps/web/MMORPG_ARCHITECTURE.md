# Turn-Based MMORPG Architecture Guide

## Overview
This guide explains how to transform SeedSlingers into a turn-based MMORPG where multiple players can interact in a shared world, battle together, and compete.

---

## 🌍 Core MMORPG Features Needed

### 1. **Shared World State**
- All players see the same world
- Other players appear on your map as you explore
- Real-time position updates when players move
- Persistent world events (boss spawns, resource nodes, etc.)

### 2. **Multiplayer Battles**
- **PvE Co-op**: Multiple players vs AI enemies
- **PvP**: Player vs Player battles
- Turn-based with all participants in the turn order
- Spectator mode for other players

### 3. **Real-Time Communication**
- Chat system (global, party, whisper)
- Party/guild systems
- Friend lists
- Trade system

### 4. **Persistent Data**
- Player progress saves across sessions
- Leaderboards
- Guild/clan persistent storage
- Trading history

---

## 🏗️ Technical Architecture

### **Database Changes**

#### New Tables Needed:

```sql
-- Online players tracking
CREATE TABLE online_players (
  player_id UUID PRIMARY KEY,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  current_activity TEXT, -- 'exploring', 'in_combat', 'crafting', etc.
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Multiplayer battles
CREATE TABLE multiplayer_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_type TEXT NOT NULL, -- 'pve_coop', 'pvp', 'raid'
  status TEXT NOT NULL, -- 'waiting', 'in_progress', 'completed'
  turn_order JSONB, -- Stores the turn order
  current_turn_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Battle participants
CREATE TABLE battle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL,
  player_id UUID NOT NULL,
  team TEXT, -- 'team_1', 'team_2', 'spectator'
  current_hp INTEGER,
  current_mp INTEGER,
  is_fainted BOOLEAN DEFAULT FALSE,
  rewards JSONB, -- Loot earned from this battle
  FOREIGN KEY (battle_id) REFERENCES multiplayer_battles(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL,
  channel TEXT NOT NULL, -- 'global', 'party', 'whisper'
  recipient_id UUID, -- For whispers
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (sender_id) REFERENCES players(id)
);

-- Parties/guilds
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  leader_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (leader_id) REFERENCES players(id)
);

CREATE TABLE party_members (
  party_id UUID NOT NULL,
  player_id UUID NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (party_id, player_id),
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

---

### **Real-Time Updates (WebSockets)**

You'll need WebSockets for real-time communication. Here's the architecture:

#### Backend: WebSocket Server
Create `/apps/web/src/app/api/multiplayer/ws/route.js`:

```javascript
// Simplified WebSocket concept (you'd use a library like ws or socket.io)
const activePlayers = new Map(); // playerId -> WebSocket connection

export async function GET(request) {
  // Upgrade HTTP to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(request);
  
  socket.onopen = () => {
    // Player connected
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Handle different message types
    switch (data.type) {
      case 'player_move':
        broadcastPlayerPosition(data.playerId, data.x, data.y);
        break;
      case 'battle_action':
        handleBattleAction(data.battleId, data.action);
        break;
      case 'chat_message':
        broadcastChatMessage(data.channel, data.message);
        break;
    }
  };
  
  return response;
}

function broadcastPlayerPosition(playerId, x, y) {
  // Send to all nearby players
  activePlayers.forEach((socket, id) => {
    if (id !== playerId) {
      socket.send(JSON.stringify({
        type: 'player_moved',
        playerId,
        x,
        y
      }));
    }
  });
}
```

#### Frontend: WebSocket Client
```javascript
// In your game page
const ws = new WebSocket('ws://yourserver.com/api/multiplayer/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'player_moved':
      updateOtherPlayerPosition(data.playerId, data.x, data.y);
      break;
    case 'battle_turn_update':
      updateBattleState(data.battleState);
      break;
  }
};

// Send your position
function movePlayer(x, y) {
  ws.send(JSON.stringify({
    type: 'player_move',
    x,
    y
  }));
}
```

---

### **Multiplayer Combat System**

#### Battle Flow:
1. **Initiate Battle**:
   - Player A starts a battle (or finds a battle invitation)
   - Other players can join within 30 seconds
   - Once started, build turn order from all participants

2. **Turn-Based Execution**:
   - Each player's turn: send action to server
   - Server validates action, applies effects
   - Server broadcasts result to all participants
   - Next player's turn

3. **Victory/Defeat**:
   - Distribute rewards to all participants
   - Calculate individual loot based on contribution

#### API Endpoints:

**Create Battle**:
```javascript
// POST /api/multiplayer/battle/create
export async function POST(request) {
  const { battleType, enemySpeciesId } = await request.json();
  const session = await auth();
  
  // Create battle in database
  const battle = await sql`
    INSERT INTO multiplayer_battles (battle_type, status)
    VALUES (${battleType}, 'waiting')
    RETURNING *
  `;
  
  // Add creator as participant
  await sql`
    INSERT INTO battle_participants (battle_id, player_id, team)
    VALUES (${battle[0].id}, ${session.user.id}, 'team_1')
  `;
  
  return Response.json({ battleId: battle[0].id });
}
```

**Join Battle**:
```javascript
// POST /api/multiplayer/battle/join
export async function POST(request) {
  const { battleId } = await request.json();
  const session = await auth();
  
  const battle = await sql`
    SELECT * FROM multiplayer_battles WHERE id = ${battleId}
  `;
  
  if (battle[0].status !== 'waiting') {
    return Response.json({ error: 'Battle already started' }, { status: 400 });
  }
  
  await sql`
    INSERT INTO battle_participants (battle_id, player_id, team)
    VALUES (${battleId}, ${session.user.id}, 'team_1')
  `;
  
  return Response.json({ success: true });
}
```

**Take Turn**:
```javascript
// POST /api/multiplayer/battle/action
export async function POST(request) {
  const { battleId, action, targetId } = await request.json();
  const session = await auth();
  
  // Verify it's this player's turn
  const battle = await sql`
    SELECT * FROM multiplayer_battles WHERE id = ${battleId}
  `;
  
  const turnOrder = battle[0].turn_order;
  const currentPlayer = turnOrder[battle[0].current_turn_index];
  
  if (currentPlayer.playerId !== session.user.id) {
    return Response.json({ error: 'Not your turn' }, { status: 400 });
  }
  
  // Execute action
  const result = executeAction(action, targetId);
  
  // Update battle state
  await sql`
    UPDATE multiplayer_battles
    SET current_turn_index = ${(battle[0].current_turn_index + 1) % turnOrder.length}
    WHERE id = ${battleId}
  `;
  
  // Broadcast to all participants via WebSocket
  broadcastBattleUpdate(battleId, result);
  
  return Response.json(result);
}
```

---

### **Other Players on Map**

Update your GameCanvas component to show other players:

```javascript
const [otherPlayers, setOtherPlayers] = useState([]);

useEffect(() => {
  const ws = new WebSocket('ws://yourserver.com/api/multiplayer/ws');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'player_moved') {
      setOtherPlayers(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(p => p.id === data.playerId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], x: data.x, y: data.y };
        } else {
          updated.push({ id: data.playerId, x: data.x, y: data.y, username: data.username });
        }
        return updated;
      });
    }
  };
  
  return () => ws.close();
}, []);

// Render other players
{otherPlayers.map(player => (
  <div
    key={player.id}
    style={{
      position: 'absolute',
      left: player.x * tileSize,
      top: player.y * tileSize,
      width: tileSize,
      height: tileSize,
      border: '2px solid blue'
    }}
  >
    <div>{player.username}</div>
  </div>
))}
```

---

## 🚀 Implementation Steps

### Phase 1: Basic Multiplayer
1. Add WebSocket server
2. Show other players on map
3. Implement chat system

### Phase 2: Multiplayer Combat
1. Create battle lobby system
2. Implement turn-based combat with multiple players
3. Add spectator mode

### Phase 3: Social Features
1. Party/guild system
2. Friend lists
3. Trading

### Phase 4: Advanced Features
1. Raids (10+ players vs boss)
2. PvP arenas
3. Leaderboards
4. World events

---

## 📊 Scaling Considerations

- **Use PostgreSQL LISTEN/NOTIFY** for real-time database events
- **Redis** for caching active battle states
- **Load balancing** for WebSocket connections
- **Database indexing** on player_id, battle_id, position_x/y

---

## 🎮 Alternative: Simpler Async Multiplayer

If you don't want real-time WebSockets, you can do **turn-based async multiplayer**:

- Players take turns when they're online
- Battle state stored in database
- Each player gets a notification when it's their turn
- Like *Pokémon Showdown* or *Words with Friends*

This is **much simpler** but less immersive than real-time multiplayer.

---

## Summary

To make this a true MMORPG, you need:
1. ✅ Persistent player data (already have this!)
2. 🔄 Real-time communication (WebSockets)
3. 🗄️ Multiplayer battle state management
4. 🌍 Shared world rendering
5. 💬 Chat & social features

The current architecture is a great foundation — you just need to add the multiplayer layer on top!
