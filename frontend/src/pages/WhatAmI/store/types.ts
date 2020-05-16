import { Action } from 'redux';

import { PeerConnection } from '../../../services';

export interface Player {
  connection?: PeerConnection;
  id: string;
  isLocal: boolean;
  join: number; // when the player joins the room
  quest?: string;
  stream?: MediaStream;
}

export interface GameRoomState {
  currentPlayerId: string;
  myId: string;
  namespace: string;
  players: Map<string, Player>;
}

export const CHANGE_CURRENT_PLAYER = 'WHATAMI_CHANGE_CURRENT_PLAYER';
export const JOINED = 'WHATAMI_JOINED';
export const GONE = 'WHATAMI_GONE';
export const NEXT_PLAYER = 'WHATAMI_NEXT_PLAYER';
export const SET_QUEST = 'WHATAMI_SET_QUEST';

export interface ChangeCurrentPlayerAction extends Action<typeof CHANGE_CURRENT_PLAYER> {
  payload: { id: string; };
}

export interface JoinedAction extends Action<typeof JOINED> {
  payload: {
    id: string;
    peerConnection?: PeerConnection;
    timestamp: number;
  };
}

export interface GoneAction extends Action<typeof GONE> {
  payload: { id: string; };
}

export interface NextPlayerAction extends Action<typeof NEXT_PLAYER> {}

export interface SetQuestAction extends Action<typeof SET_QUEST> {
  payload: {
    id: string;
    quest: string;
  };
}

export type GameRoomAction = ChangeCurrentPlayerAction
  | JoinedAction
  | GoneAction
  | NextPlayerAction
  | SetQuestAction;
