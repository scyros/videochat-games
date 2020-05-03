import { createSelector } from 'reselect';

import { GameRoomState } from './types';

export const gameRoom = (state: any) => state.gameRoom as GameRoomState;
export const myId = createSelector([gameRoom], gr => gr.myId);
export const namespace = createSelector([gameRoom], gr => gr.namespace);
export const localPlayer = createSelector([gameRoom], gr => gr.players.get(gr.myId));
export const imHostPlayer = createSelector(
  [gameRoom],
  gr => Array.from(gr.players.values()).sort((a, b) => a.join - b.join)[0]?.id === gr.myId,
);
export const currentPlayer = createSelector([gameRoom], gr => gr.players.get(gr.currentPlayerId));
