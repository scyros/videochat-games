import { put, select, takeEvery } from 'redux-saga/effects';

import { Api, INCOMING_MESSAGE, IncomingMessageAction } from '../../../services';

import { selectGameRoom, GameRoomState, JoinedAction, LeaveAction, JOINED,
  LEAVE } from '../store';

function* joined({ payload: { msg: { from, type } } }: IncomingMessageAction) {
  const state: GameRoomState = yield select(selectGameRoom);
  const isPlayer = Boolean(state.playerIds.find(id => id === from));

  if (type === 'join' && !isPlayer) {
    yield put<JoinedAction>({ type: JOINED, payload: { id: from! } });
    Api.getInstance().send({ type: 'join', to: from });
  } else if (type === 'leave') {
    yield put<LeaveAction>({ type: LEAVE, payload: { id: from! } });
  }
}

export function* saga() {
  yield takeEvery(INCOMING_MESSAGE, joined);
}
