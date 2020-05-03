import { put, select, takeEvery, takeLeading } from 'redux-saga/effects';

import {
  Api,
  IncomingMessageAction,
  PeerConnection,
  INCOMING_MESSAGE,
  LOCALSTREAM_AVAILABLE,
  LocalStreamAvailableAction,
} from '../../../services';

import {
  gameRoom,
  GameRoomState,
  JoinedAction,
  LeaveAction,
  JOIN,
  JOINED,
  LEAVE,
} from '../store';

// Should occurs when some player enters in the room
function* joined({ payload: { msg: { from, payload, to, type } } }: IncomingMessageAction) {
  const state: GameRoomState = yield select(gameRoom);
  const localPlayer = state.players.get(state.myId);
  const isPlayer = state.players.has(from!);

  if (type === 'join' && !isPlayer) {
    const { timestamp, currentPlayerId } = payload;
    const joinPayload: any = { id: from!, timestamp };
    if (to === state.myId) joinPayload.currentPlayerId = currentPlayerId;
    yield put<JoinedAction>({
      type: JOINED,
      payload: joinPayload,
    });
    yield Api.getInstance().send({
      type: 'join',
      to: from,
      payload: {
        timestamp: localPlayer!.join,
        currentPlayerId: state.currentPlayerId,
      },
    });
  } else if (type === 'leave') {
    yield put<LeaveAction>({ type: LEAVE, payload: { id: from! } });
  }
}

function* join() {
  const stream = yield PeerConnection.localStream;
  yield put<LocalStreamAvailableAction>({
    type: LOCALSTREAM_AVAILABLE,
    payload: { stream },
  });
}

export function* saga() {
  yield takeEvery(INCOMING_MESSAGE, joined);
  yield takeLeading(JOIN, join);
}
