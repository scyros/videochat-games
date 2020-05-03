import { AnyAction } from 'redux';

import { LOCALSTREAM_AVAILABLE, LocalStreamAvailableAction } from '../../../services'

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
    const { payload: { id, namespace, timestamp } } = action;
    const { players } = state;
    if (!players.has(id)) {
      players.set(id, { id, join: timestamp });
    }

    return {
      ...state,
      currentPlayerId: id,
      myId: id,
      namespace,
      players,
    };
  },
  [JOINED]: (state, _action) => {
    const action = _action as JoinedAction;
    const { payload: { id, timestamp, currentPlayerId } } = action;
    const { players } = state;
    if (!players.has(id)) {
      players.set(id, { id, join: timestamp });
    }

    return {
      ...state,
      currentPlayerId: currentPlayerId || state.currentPlayerId,
      players,
    };
  },
  [LEAVE]: (state, _action) => {
    const action = _action as LeaveAction;
    const { payload: { id } } = action;
    const { players } = state;

    let currentPlayerId = state.currentPlayerId;
    if (state.currentPlayerId === id) {
      const playersList = Array.from(state.players.values())
        .sort((a, b) => a.join - b.join);
      let playerIdx = playersList.findIndex(p => p.id === id);
      if ((playerIdx + 1) >= players.size) playerIdx = -1;
      currentPlayerId = playersList[playerIdx + 1].id;
    }

    players.delete(id);

    return {
      ...state,
      currentPlayerId,
      players,
    };
  },
  [LOCALSTREAM_AVAILABLE]: (state, _action) => {
    const action = _action as LocalStreamAvailableAction;
    const player = state.players.get(state.myId);
    player!.stream = action.payload.stream;
    state.players.delete(state.myId);
    state.players.set(state.myId, { ...player! });

    return { ...state };
  },
};

const initialState: GameRoomState = {
  currentPlayerId: '',
  myId: '',
  namespace: '',
  players: new Map(),
};

export const reducer = (
  state: GameRoomState = initialState,
  action: AnyAction,
) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
