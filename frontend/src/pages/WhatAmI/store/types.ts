import { Action } from 'redux';

export interface GameRoomState {
  namespace: string;
  playerIds: string[];
}

export const JOIN = 'WHATAMI_JOIN';
export const JOINED = 'WHATAMI_JOINED';
export const LEAVE = 'WHATAMI_LEAVE';

export interface JoinAction extends Action<typeof JOIN> {
  payload: { id: string; namespace: string; };
}
export interface JoinedAction extends Action<typeof JOINED> {
  payload: { id: string; };
}
export interface LeaveAction extends Action<typeof LEAVE> {
  payload: { id: string; };
}

export type GameRoomAction = JoinAction | JoinedAction | LeaveAction;
