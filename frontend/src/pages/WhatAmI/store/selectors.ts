import { createSelector } from 'reselect';

import { GameRoomState } from './types';

export const gameRoom = (state: any) => state.gameRoom as GameRoomState;
export const myId = createSelector([gameRoom], gr => gr.myId);
export const namespace = createSelector([gameRoom], gr => gr.namespace);
export const localPlayer = createSelector([gameRoom], gr => gr.players.get(gr.myId));
export const imHostPlayer = createSelector(
  [gameRoom],
  gr => Array.from(gr.players.values())
    .sort((a, b) => a.join - b.join)[0]?.id === gr.myId,
);
export const currentPlayer = createSelector([gameRoom], gr => gr.players.get(gr.currentPlayerId));
export const players = createSelector(
  [gameRoom],
  gr => Array.from(gr.players.values())
    .sort((a, b) => a.join - b.join)
    .filter(p => p.id !== gr.currentPlayerId),
);
export const nextTurn = createSelector(
  [gameRoom, currentPlayer],
  (gr, currentPlayer) => {
    const players = Array.from(gr.players.values())
      .sort((a, b) => a.join - b.join);
    const currentPlayerIndex = players.findIndex(p => currentPlayer?.id === p.id);
    const nextPlayerIndex = (currentPlayerIndex === (gr.players.size - 1) ? -1 : currentPlayerIndex) + 1;
    return players[nextPlayerIndex];
  },
);
