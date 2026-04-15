import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Faction, RoomInfo, Screen, ClientUIState, DiplomacyStatus, UnitType, UnitCount } from './types';

function totalCount(units: UnitCount[]): number {
  return units.reduce((s, u) => s + u.count, 0);
}
import socket from './socket';
import LobbyScreen from './components/LobbyScreen';
import WaitingRoom from './components/WaitingRoom';
import GameMap from './components/GameMap';
import SidePanel from './components/SidePanel';
import EndScreen from './components/EndScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(0);
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [uiState, setUIState] = useState<ClientUIState>({ selectedTerritoryId: null, moveFrom: null });
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on('room_created', ({ code, room, myPlayerIndex: idx }: { code: string; room: RoomInfo; myPlayerIndex: number }) => {
      setRoomInfo(room);
      setMyPlayerIndex(idx);
      setIsHost(true);
      setIsConnecting(false);
      setError(null);
      setScreen('waiting');
    });

    socket.on('room_joined', ({ room, myPlayerIndex: idx }: { room: RoomInfo; myPlayerIndex: number }) => {
      setRoomInfo(room);
      setMyPlayerIndex(idx);
      setIsHost(false);
      setIsConnecting(false);
      setError(null);
      setScreen('waiting');
    });

    socket.on('room_updated', ({ room }: { room: RoomInfo }) => {
      setRoomInfo(room);
    });

    socket.on('game_started', ({ gameState: gs }: { gameState: GameState }) => {
      setGameState(gs);
      setUIState({ selectedTerritoryId: null, moveFrom: null });
      setScreen('playing');
    });

    socket.on('state_updated', ({ gameState: gs }: { gameState: GameState }) => {
      setGameState(gs);
      setUIState({ selectedTerritoryId: null, moveFrom: null });

      // Detect AI turn
      const currentIsAI = gs.players[gs.currentPlayerId]?.isAI ?? false;
      setIsAITurn(currentIsAI && gs.phase === 'playing');

      if (gs.phase === 'ended') setScreen('ended');
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
      setIsConnecting(false);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('state_updated');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

  // ── Lobby actions ─────────────────────────────────────────────────────────
  const handleCreateRoom = useCallback((name: string, faction: Faction) => {
    setIsConnecting(true);
    setError(null);
    socket.emit('create_room', { name, faction });
  }, []);

  const handleJoinRoom = useCallback((code: string, name: string, faction: Faction) => {
    setIsConnecting(true);
    setError(null);
    socket.emit('join_room', { code, name, faction });
  }, []);

  const handleStartGame = useCallback((aiCount: number) => {
    socket.emit('start_game', { aiCount });
  }, []);

  // ── In-game actions ───────────────────────────────────────────────────────
  const isMyTurn = gameState !== null && gameState.currentPlayerId === myPlayerIndex;

  const handleTerritoryClick = useCallback((id: number) => {
    if (!gameState || !isMyTurn) return;
    const { territories, players } = gameState;
    const { moveFrom } = uiState;

    if (moveFrom !== null) {
      if (id === moveFrom) {
        setUIState({ selectedTerritoryId: null, moveFrom: null });
        return;
      }

      // Check if valid target
      const from = territories[moveFrom];
      const to = territories[id];
      const adjacent = from.adjacentIds.includes(id);
      const canAttack = to.ownerId === null || to.ownerId === myPlayerIndex ||
        players[myPlayerIndex].diplomacy[to.ownerId] !== 'ally';

      if (adjacent && canAttack && totalCount(from.units) >= 2) {
        socket.emit('move_armies', { fromId: moveFrom, toId: id });
        setUIState({ selectedTerritoryId: null, moveFrom: null });
        return;
      }

      setUIState({ selectedTerritoryId: null, moveFrom: null });
      return;
    }

    // Select own territory with enough units to move
    if (territories[id].ownerId === myPlayerIndex && totalCount(territories[id].units) >= 2) {
      setUIState({ selectedTerritoryId: id, moveFrom: id });
    }
  }, [gameState, isMyTurn, myPlayerIndex, uiState]);

  const handleDiplomacy = useCallback((targetId: number, status: DiplomacyStatus) => {
    socket.emit('set_diplomacy', { targetId, status });
  }, []);

  const handleRecruit = useCallback((territoryId: number, unitType: UnitType, count: number) => {
    socket.emit('recruit', { territoryId, unitType, count });
  }, []);

  const handleResearchTech = useCallback((techId: string) => {
    socket.emit('research_tech', { techId });
  }, []);

  const handleEndTurn = useCallback(() => {
    socket.emit('end_turn');
    setUIState({ selectedTerritoryId: null, moveFrom: null });
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('lobby');
    setRoomInfo(null);
    setGameState(null);
    setUIState({ selectedTerritoryId: null, moveFrom: null });
    setError(null);
    setIsAITurn(false);
    socket.disconnect();
    socket.connect();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <LobbyScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={error}
        isConnecting={isConnecting}
      />
    );
  }

  if (screen === 'waiting' && roomInfo) {
    return (
      <WaitingRoom
        roomInfo={roomInfo}
        myPlayerIndex={myPlayerIndex}
        isHost={isHost}
        onStartGame={handleStartGame}
      />
    );
  }

  if (screen === 'ended' && gameState) {
    return <EndScreen state={gameState} onRestart={handleRestart} />;
  }

  if (screen === 'playing' && gameState) {
    return (
      <div className="game-layout">
        <div className="map-area">
          <GameMap
            state={gameState}
            uiState={uiState}
            myPlayerIndex={myPlayerIndex}
            isMyTurn={isMyTurn && !isAITurn}
            onTerritoryClick={handleTerritoryClick}
          />
        </div>
        <SidePanel
          state={gameState}
          myPlayerIndex={myPlayerIndex}
          isMyTurn={isMyTurn && !isAITurn}
          isAITurn={isAITurn}
          onDiplomacy={handleDiplomacy}
          onRecruit={handleRecruit}
          onResearchTech={handleResearchTech}
          onEndTurn={handleEndTurn}
        />
      </div>
    );
  }

  return <div style={{ color: '#fff', padding: 40 }}>연결 중...</div>;
}
