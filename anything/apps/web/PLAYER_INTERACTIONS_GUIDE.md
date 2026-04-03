# Player Interaction System - Runescape Duel Arena Style

This guide explains the player-to-player interaction system in SeedSlingers, inspired by Runescape's Duel Arena.

## Overview

Players can now interact with each other in three key ways:
1. **Trading** - Exchange items with other players
2. **Dueling** - Challenge players to PvP battles with optional wagers
3. **Friendships** - Add players to your friends list

## How to Interact with Players

### Finding Players

1. Players appear in the game world as **blue sprites** with their username displayed above them
2. Nearby players are shown within a 15-tile radius
3. You can see them moving in real-time as they explore the world

### Opening the Interaction Menu

**Click directly on any nearby player sprite** to open the Player Interaction Modal with the following options:

- 🤝 **Trade Items** - Initiate a trade
- ⚔️ **Challenge to Duel** - Challenge them to a battle
- 👥 **Add Friend** - Send a friend request

## Trading System

### How Trading Works

1. **Initiate**: Click a player and select "Trade Items"
2. **Acceptance**: The other player receives a trade request
3. **Offer Items**: Both players add items to their offers
4. **Confirm**: Both players must click "Confirm Trade"
5. **Complete**: Items are exchanged automatically when both confirm

### Trading Interface

- **Your Offer** (left panel): Select items from your inventory to offer
- **Their Offer** (right panel): See what the other player is offering
- **Ready Status**: ✓ appears when a player confirms
- **Cancel**: Either player can cancel at any time before both confirm

### Trade Safety

- Both players must explicitly confirm the trade
- Trades are executed atomically (all-or-nothing)
- You can only trade items you currently have in your inventory

## Duel System (Like Runescape Duel Arena)

### How Dueling Works

1. **Challenge**: Click a player and select "Challenge to Duel"
2. **Set Wager**: Choose currency type and amount (optional)
   - **Scrap Metal** - Common currency
   - **Bio-Resin** - Rare material
   - **Data Seeds** - Premium currency
3. **Acceptance**: Opponent must accept the challenge
4. **Battle**: Fight in turn-based combat
5. **Winner Takes All**: Winner receives both wagers

### Wager System

- Wagers are **optional** - you can duel for 0 currency
- Both players stake the **same amount** of the same currency
- Winner receives **2x the wager** (their wager + opponent's wager)
- Loser loses their entire wager

**Example:**
- Player A challenges Player B with 100 Scrap Metal wager
- Player B accepts (must have 100 Scrap Metal)
- Winner receives 200 Scrap Metal total
- Loser loses 100 Scrap Metal

### Duel Safety

- You must have enough currency to cover the wager
- Opponent is checked for sufficient funds when accepting
- Wagers are deducted only when the duel completes
- No partial wagers - it's all or nothing

## Friend System

### Managing Friends

1. **Send Request**: Click a player and select "Add Friend"
2. **View Requests**: Click the **👥 SOCIAL** button in the header
3. **Accept/Decline**: Respond to pending friend requests
4. **Friends List**: See all your friends and their levels

### Social Panel

The **👥 SOCIAL** button opens the Requests & Friends panel where you can:
- View pending friend requests
- Accept or decline requests
- See your current friends list
- (Future) Send messages to friends

## API Endpoints

All interaction endpoints are located under `/api/multiplayer/`:

### Trade Endpoints
- `POST /api/multiplayer/trade/initiate` - Start a trade
- `POST /api/multiplayer/trade/respond` - Accept/decline trade
- `POST /api/multiplayer/trade/offer` - Update your offer
- `POST /api/multiplayer/trade/ready` - Confirm trade
- `POST /api/multiplayer/trade/cancel` - Cancel trade
- `GET /api/multiplayer/trade/status` - Poll trade status

### Duel Endpoints
- `POST /api/multiplayer/duel/challenge` - Send duel challenge
- `POST /api/multiplayer/duel/respond` - Accept/decline duel
- `POST /api/multiplayer/duel/complete` - Finish duel and distribute winnings

### Friend Endpoints
- `POST /api/multiplayer/friend/request` - Send friend request
- `POST /api/multiplayer/friend/respond` - Accept/decline friend request
- `GET /api/multiplayer/friend/list` - Get friends and pending requests

## Database Schema

### trade_sessions
```sql
- id (UUID)
- initiator_id (player UUID)
- recipient_id (player UUID)
- status (pending/active/completed/cancelled/declined)
- initiator_offer (JSONB array of items)
- recipient_offer (JSONB array of items)
- initiator_ready (boolean)
- recipient_ready (boolean)
```

### duel_challenges
```sql
- id (UUID)
- challenger_id (player UUID)
- opponent_id (player UUID)
- status (pending/accepted/declined/completed/cancelled)
- wager_currency (scrap_metal/bio_resin/data_seeds)
- wager_amount (integer)
- winner_id (player UUID, nullable)
- battle_log (JSONB)
```

### friendships
```sql
- id (UUID)
- player_id (UUID)
- friend_id (UUID)
- status (pending/accepted/blocked)
```

## Tips & Strategies

### Trading
- Check the other player's reputation before trading
- Always verify their offer before confirming
- Use trades to exchange rare materials

### Dueling
- Start with small wagers to test your skills
- Higher wagers mean higher risk and reward
- Choose your party Sprouts wisely before accepting

### Friends
- Build a network of trusted players
- Coordinate with friends for guild activities
- (Future) Team up for co-op battles

## Future Features

Planned enhancements:
- **Direct messaging** between friends
- **Party invites** from friends
- **Trade history** log
- **Duel rankings** leaderboard
- **Spectate duels** feature
- **Trade confirmation window** with item previews

## Troubleshooting

**Can't see other players?**
- Make sure you're in the same zone (check coordinates)
- Players only appear within 15 tiles
- Heartbeat updates every 3 seconds

**Trade request not going through?**
- Verify the player username is correct
- Check if player is online
- Ensure no existing pending trade

**Duel wager error?**
- Confirm you have enough currency
- Check opponent hasn't spent their funds
- Wagers must be non-negative integers

## Credits

Inspired by:
- **Runescape's Duel Arena** - Wagered PvP combat system
- **Old School Runescape** - Player trading interface
- **MMO trading systems** - Secure item exchanges
