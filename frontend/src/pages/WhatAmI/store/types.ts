import { Action } from 'redux';

export interface Player {
  id: string;
  join: number; // when the player joins the room
  stream?: MediaStream;
}

export interface GameRoomState {
  currentPlayerId: string;
  myId: string;
  namespace: string;
  players: Map<string, Player>;
}

export const JOIN = 'WHATAMI_JOIN';
export const JOINED = 'WHATAMI_JOINED';
export const LEAVE = 'WHATAMI_LEAVE';

export interface JoinAction extends Action<typeof JOIN> {
  payload: { id: string; namespace: string; timestamp: number };
}
export interface JoinedAction extends Action<typeof JOINED> {
  payload: { id: string; timestamp: number; currentPlayerId?: string };
}
export interface LeaveAction extends Action<typeof LEAVE> {
  payload: { id: string; };
}

export type GameRoomAction = JoinAction | JoinedAction | LeaveAction;
