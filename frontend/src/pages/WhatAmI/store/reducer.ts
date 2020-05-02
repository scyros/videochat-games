import { AnyAction } from 'redux';

import {
  GameRoomState,
  JoinAction,
  JoinedAction,
  LeaveAction,
  JOIN,
  JOINED,
  LEAVE,
} from './types';

interface ActionHandler {
  [action: string]: (state: GameRoomState, action: AnyAction) => GameRoomState;
}

const ACTION_HANDLERS: ActionHandler = {
  [JOIN]: (state, _action) => {
    const action = _action as JoinAction;
    const { payload: { id, namespace } } = action;
    return {
      ...state,
      namespace,
      playerIds: Array.from(new Set<string>([...state.playerIds, id])),
    };
  },
  [JOINED]: (state, _action) => {
    const action = _action as JoinedAction;
    const { payload: { id } } = action;
    return {
      ...state,
      playerIds: Array.from(new Set<string>([...state.playerIds, id])),
    };
  },
  [LEAVE]: (state, _action) => {
    const action = _action as LeaveAction;
    const { payload: { id } } = action;
    const idx = state.playerIds.findIndex(i => i === id);
    const playerIds = [...state.playerIds];
    playerIds.splice(idx, 1);

    return {
      ...state,
      playerIds,
    };
  },
};

const initialState: GameRoomState = {
  namespace: '',
  playerIds: [],
};

export const reducer = (
  state: GameRoomState = initialState,
  action: AnyAction,
) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
