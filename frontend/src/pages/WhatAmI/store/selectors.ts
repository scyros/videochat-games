import { createSelector } from 'reselect';

import { GameRoomState } from './types';

export const selectGameRoom = (state: any) => state.gameRoom as GameRoomState;
export const selectNamespace = createSelector(
  [selectGameRoom],
  gameRoomState => gameRoomState.namespace,
);
