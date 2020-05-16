import { AnyAction } from 'redux';

import {
  ConnectAction,
  LocalStreamAvailableAction,
  RemoteStreamAvailableAction,
  CONNECT,
  LOCALSTREAM_AVAILABLE,
  REMOTESTREAM_AVAILABLE,
  REMOTESTREAM_UNAVAILABLE,
  RemoteStreamUnavailableAction,
} from '../../../services'

import {
  ChangeCurrentPlayerAction,
  GameRoomState,
  GoneAction,
  JoinedAction,
  SetQuestAction,
  CHANGE_CURRENT_PLAYER,
  GONE,
  JOINED,
  SET_QUEST,
} from './types';

interface ActionHandler {
  [action: string]: (state: GameRoomState, action: AnyAction) => GameRoomState;
}

const ACTION_HANDLERS: ActionHandler = {
  [CHANGE_CURRENT_PLAYER]: (state, _action) => {
    const action = _action as ChangeCurrentPlayerAction;
    const { payload: { id: currentPlayerId } } = action;
    
    return {
      ...state,
      currentPlayerId,
    };
  },
  [CONNECT]: (state, _action) => {
    const action = _action as ConnectAction;
    const { payload: { id: myId, namespace } } = action;
    
    return {
      ...state,
      currentPlayerId: myId,
      myId,
      namespace,
    }
  },
  [GONE]: (state, _action) => {
    const action = _action as GoneAction;
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

    players.get(id)?.connection?.close(true);
    players.delete(id);

    return {
      ...state,
      currentPlayerId,
      players,
    };
  },
  [JOINED]: (state, _action) => {
    const action = _action as JoinedAction;
    const { payload: { id, peerConnection: connection, timestamp: join } } = action;
    const { players } = state;
    if (!players.has(id)) {
      players.set(id, { id, connection, join, isLocal: !Boolean(connection) });
    }

    return {
      ...state,
      players,
    };
  },
  [LOCALSTREAM_AVAILABLE]: (state, _action) => {
    const action = _action as LocalStreamAvailableAction;
    const player = state.players.get(state.myId);
    if (player) {
      player.stream = action.payload.stream;
      state.players.delete(state.myId);
      state.players.set(state.myId, { ...player });
    }

    return { ...state };
  },
  [REMOTESTREAM_AVAILABLE]: (state, _action) => {
    const action = _action as RemoteStreamAvailableAction;
    const { id, stream } = action.payload;
    const player = state.players.get(id);
    if (player) {
      player.stream = stream;
      state.players.delete(id);
      state.players.set(id, { ...player });
    }

    return { ...state };
  },
  [REMOTESTREAM_UNAVAILABLE]: (state, _action) => {
    const action = _action as RemoteStreamUnavailableAction;
    const { payload: { id } } = action;
    const player = state.players.get(id);
    if (player) {
      player.stream = undefined;
      state.players.delete(id);
      state.players.set(id, { ...player });
    }

    return { ...state };
  },
  [SET_QUEST]: (state, _action) => {
    const action = _action as SetQuestAction;
    const { payload: { id, quest } } = action;
    const player = state.players.get(id);

    if (player) {
      player.quest = quest;
      state.players.delete(id);
      state.players.set(id, { ...player });
    }

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
