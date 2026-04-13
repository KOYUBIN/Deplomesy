import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import type { Faction, Room, RoomInfo, GameState, DiplomacyStatus } from './types';
import { createInitialState, moveArmies, recruitArmies, setDiplomacy, endTurn, canMoveTo } from './gameLogic';
import { runAITurns } from './aiPlayer';
import { AI_NAMES, AI_FACTIONS, PLAYER_COLORS } from './mapData';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Serve built client in production
app.use(express.static(path.join(__dirname, '../../dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// ── Room store ──────────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function toRoomInfo(room: Room): RoomInfo {
  return {
    code: room.code,
    players: room.players.map((p) => ({
      name: p.name,
      faction: p.faction,
      playerIndex: p.playerIndex,
    })),
    started: room.gameState !== null,
  };
}

function getPlayerIndex(room: Room, socketId: string): number | null {
  return room.players.find((p) => p.socketId === socketId)?.playerIndex ?? null;
}

// ── AI trigger ─────────────────────────────────────────────────────────────

async function triggerAIIfNeeded(room: Room): Promise<void> {
  if (!room.gameState || room.aiRunning || room.gameState.phase !== 'playing') return;
  const current = room.gameState.currentPlayerId;
  const isHuman = room.players.some((p) => p.playerIndex === current);
  if (isHuman) return;

  room.aiRunning = true;
  room.gameState = await runAITurns(room.gameState, (s: GameState) => {
    room.gameState = s;
    io.to(room.code).emit('state_updated', { gameState: s });
  });
  room.aiRunning = false;
  io.to(room.code).emit('state_updated', { gameState: room.gameState });
}

// ── Socket handlers ─────────────────────────────────────────────────────────

io.on('connection', (socket: Socket) => {
  let currentRoomCode: string | null = null;

  // ── Create room ──────────────────────────────────────────────────────────
  socket.on('create_room', ({ name, faction }: { name: string; faction: Faction }) => {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode();

    const room: Room = {
      code,
      hostSocketId: socket.id,
      players: [{ socketId: socket.id, name: name.trim() || '사령관', faction, playerIndex: 0 }],
      gameState: null,
      aiRunning: false,
    };
    rooms.set(code, room);
    currentRoomCode = code;
    socket.join(code);
    socket.emit('room_created', { code, room: toRoomInfo(room), myPlayerIndex: 0 });
  });

  // ── Join room ────────────────────────────────────────────────────────────
  socket.on('join_room', ({ code, name, faction }: { code: string; name: string; faction: Faction }) => {
    const upperCode = code.toUpperCase().trim();
    const room = rooms.get(upperCode);
    if (!room) { socket.emit('error', { message: '방을 찾을 수 없습니다. 코드를 확인해주세요.' }); return; }
    if (room.gameState) { socket.emit('error', { message: '이미 게임이 시작됐습니다.' }); return; }
    if (room.players.length >= 6) { socket.emit('error', { message: '방이 가득 찼습니다.' }); return; }

    const playerIndex = room.players.length;
    room.players.push({ socketId: socket.id, name: name.trim() || '사령관', faction, playerIndex });
    currentRoomCode = upperCode;
    socket.join(upperCode);

    socket.emit('room_joined', { code: upperCode, myPlayerIndex: playerIndex, room: toRoomInfo(room) });
    socket.to(upperCode).emit('room_updated', { room: toRoomInfo(room) });
  });

  // ── Start game ───────────────────────────────────────────────────────────
  socket.on('start_game', ({ aiCount }: { aiCount: number }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    const humanCount = room.players.length;
    const safeAiCount = Math.min(Math.max(0, aiCount), 6 - humanCount);
    const total = humanCount + safeAiCount;
    if (total < 2) { socket.emit('error', { message: '최소 2명(AI 포함)이 필요합니다.' }); return; }

    // Collect taken names for AI name deduplication
    const takenNames = room.players.map((p) => p.name);

    const playerSetups = [
      ...room.players
        .sort((a, b) => a.playerIndex - b.playerIndex)
        .map((p) => ({ name: p.name, faction: p.faction, isAI: false })),
    ];

    for (let i = 0; i < safeAiCount; i++) {
      const faction = AI_FACTIONS[(humanCount + i) % AI_FACTIONS.length];
      const pool = AI_NAMES[faction].filter((n) => !takenNames.includes(n));
      const aiName = pool.length > 0 ? pool[0] : `AI-${i + 1}`;
      takenNames.push(aiName);
      playerSetups.push({ name: aiName, faction, isAI: true });
    }

    // Reassign colors to match slot order
    const state = createInitialState(playerSetups);
    room.gameState = state;

    io.to(currentRoomCode).emit('game_started', { gameState: state });
    triggerAIIfNeeded(room);
  });

  // ── In-game actions ──────────────────────────────────────────────────────

  function validateAndUpdate(
    action: (state: GameState) => GameState
  ): void {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || !room.gameState || room.aiRunning) return;
    const pid = getPlayerIndex(room, socket.id);
    if (pid === null || pid !== room.gameState.currentPlayerId) return;

    room.gameState = action(room.gameState);
    io.to(currentRoomCode).emit('state_updated', { gameState: room.gameState });
  }

  socket.on('move_armies', ({ fromId, toId }: { fromId: number; toId: number }) => {
    validateAndUpdate((s) => moveArmies(s, fromId, toId));
  });

  socket.on('recruit', ({ territoryId, count }: { territoryId: number; count: number }) => {
    validateAndUpdate((s) => recruitArmies(s, territoryId, count));
  });

  socket.on('set_diplomacy', ({ targetId, status }: { targetId: number; status: DiplomacyStatus }) => {
    validateAndUpdate((s) => setDiplomacy(s, targetId, status));
  });

  socket.on('end_turn', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || !room.gameState || room.aiRunning) return;
    const pid = getPlayerIndex(room, socket.id);
    if (pid === null || pid !== room.gameState.currentPlayerId) return;

    room.gameState = endTurn(room.gameState);
    io.to(currentRoomCode).emit('state_updated', { gameState: room.gameState });
    triggerAIIfNeeded(room);
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    if (!room.gameState) {
      // Pre-game: remove from room
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(currentRoomCode);
      } else {
        // Reassign host if needed
        if (room.hostSocketId === socket.id) room.hostSocketId = room.players[0].socketId;
        io.to(currentRoomCode).emit('room_updated', { room: toRoomInfo(room) });
      }
    }
    // Mid-game: keep slot, player just can't act (connection lost)
  });
});

// ── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[디플로메시 서버] http://localhost:${PORT}`);
});
