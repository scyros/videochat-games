import { delay, put, select, takeEvery } from 'redux-saga/effects';

import {
  Api,
  IncomingMessageAction,
  PeerConnection,
  INCOMING_MESSAGE,
} from '../../../services';

import {
  gameRoom,
  imHostPlayer,
  localPlayer,
  GameRoomState,
  ChangeCurrentPlayerAction,
  GoneAction,
  JoinedAction,
  Player,
  CHANGE_CURRENT_PLAYER,
  GONE,
  JOINED,
} from '../store';

// Should occurs when some player enters in the room
function* join({ payload: { msg: { from, payload, to, type } } }: IncomingMessageAction) {
  const state: GameRoomState = yield select(gameRoom);
  const isPlayer = state.players.has(from!);

  if (type === 'join' && !isPlayer) {
    const { timestamp } = payload;
    const joinPayload: any = { id: from!, timestamp };
    let peerConnection: PeerConnection | null = null;

    if (from === state.myId) { // my own joining
      yield put<JoinedAction>({ type: JOINED, payload: joinPayload });
      yield PeerConnection.getLocalStream();
      return;
    }

    peerConnection = PeerConnection.getConnection(state.myId, from!);
    joinPayload.peerConnection = peerConnection;
    yield put<JoinedAction>({ type: JOINED, payload: joinPayload });

    if (to !== state.myId) { // newer player is joining
      const me: Player = yield select(localPlayer);
      yield Api.getInstance().send({
        type: 'join',
        to: from,
        payload: { timestamp: me.join },
      });

      const imHost = select(imHostPlayer);
      if (imHost) {
        yield Api.getInstance().send({
          type: CHANGE_CURRENT_PLAYER,
          payload: { id: state.currentPlayerId },
        });
      }
    }

    yield delay(500);
    yield peerConnection.startConnection();
  } else if (type === 'gone') {
    yield put<GoneAction>({ type: GONE, payload: { id: from! } });
  } else if (type === CHANGE_CURRENT_PLAYER) {
    const { id } = payload;
    const imHost = yield select(imHostPlayer);

    if (!imHost) {
      yield put<ChangeCurrentPlayerAction>({
        type: CHANGE_CURRENT_PLAYER,
        payload: { id },
      });
    }
  }
}

export function* saga() {
  yield takeEvery(INCOMING_MESSAGE, join);
}
