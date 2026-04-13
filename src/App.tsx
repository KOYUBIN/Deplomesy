import React, { useState, useCallback, useRef } from 'react';
import type { GameState, SetupConfig } from './types';
import { createInitialState, moveArmies, recruitArmies, setDiplomacy, endTurn, canMoveTo } from './gameLogic';
import { runAITurns } from './aiPlayer';
import GameMap from './components/GameMap';
import SidePanel from './components/SidePanel';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import type { DiplomacyStatus } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const aiRunning = useRef(false);

  const handleStart = useCallback((cfg: SetupConfig) => {
    setGameState(createInitialState(cfg));
    setIsAITurn(false);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(null);
    setIsAITurn(false);
    aiRunning.current = false;
  }, []);

  const triggerAIIfNeeded = useCallback(async (state: GameState) => {
    if (state.phase !== 'playing') return;
    if (!state.players[state.currentPlayerId].isAI) return;
    if (aiRunning.current) return;

    aiRunning.current = true;
    setIsAITurn(true);

    const finalState = await runAITurns(state, (s) => setGameState({ ...s }));
    aiRunning.current = false;
    setIsAITurn(false);
    setGameState({ ...finalState });
  }, []);

  const handleTerritoryClick = useCallback(
    (id: number) => {
      if (!gameState || isAITurn || gameState.currentPlayerId !== 0) return;

      const { territories, players, moveFrom, actionMode } = gameState;
      const clicked = territories[id];

      // If a move is in progress
      if (moveFrom !== null) {
        if (id === moveFrom) {
          // Deselect
          setGameState({ ...gameState, moveFrom: null, selectedTerritoryId: null, actionMode: 'none' });
          return;
        }
        if (canMoveTo(territories, players, moveFrom, id, 0)) {
          const newState = moveArmies(gameState, moveFrom, id);
          setGameState(newState);
          return;
        }
        // Invalid target - just deselect
        setGameState({ ...gameState, moveFrom: null, selectedTerritoryId: null, actionMode: 'none' });
        return;
      }

      // Select own territory
      if (clicked.ownerId === 0 && clicked.armies >= 2) {
        setGameState({
          ...gameState,
          moveFrom: id,
          selectedTerritoryId: id,
          actionMode: 'move',
        });
      }
    },
    [gameState, isAITurn]
  );

  const handleDiplomacy = useCallback(
    (targetId: number, status: DiplomacyStatus) => {
      if (!gameState || isAITurn || gameState.currentPlayerId !== 0) return;
      setGameState(setDiplomacy(gameState, targetId, status));
    },
    [gameState, isAITurn]
  );

  const handleRecruit = useCallback(
    (territoryId: number, count: number) => {
      if (!gameState || isAITurn || gameState.currentPlayerId !== 0) return;
      setGameState(recruitArmies(gameState, territoryId, count));
    },
    [gameState, isAITurn]
  );

  const handleEndTurn = useCallback(async () => {
    if (!gameState || isAITurn || gameState.currentPlayerId !== 0) return;
    const newState = endTurn(gameState);
    setGameState(newState);
    await triggerAIIfNeeded(newState);
  }, [gameState, isAITurn, triggerAIIfNeeded]);

  const handleRecruitMode = useCallback(
    (territoryId: number) => {
      if (!gameState) return;
      setGameState({
        ...gameState,
        moveFrom: null,
        selectedTerritoryId: territoryId,
        actionMode: 'none',
      });
    },
    [gameState]
  );

  if (!gameState) {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.phase === 'ended') {
    return <EndScreen state={gameState} onRestart={handleRestart} />;
  }

  return (
    <div className="game-layout">
      <div className="map-area">
        <GameMap
          state={gameState}
          onTerritoryClick={handleTerritoryClick}
          isAITurn={isAITurn || gameState.currentPlayerId !== 0}
        />
      </div>
      <SidePanel
        state={gameState}
        isAITurn={isAITurn || gameState.currentPlayerId !== 0}
        onDiplomacy={handleDiplomacy}
        onRecruit={handleRecruit}
        onEndTurn={handleEndTurn}
        onRecruitMode={handleRecruitMode}
      />
    </div>
  );
}
