import { put, select, takeEvery } from 'redux-saga/effects';

import {
  Api,
  IncomingMessageAction,
  PeerConnection,
  Quest,
  INCOMING_MESSAGE,
} from '../../../services';

import {
  currentPlayer,
  gameRoom,
  imHostPlayer,
  localPlayer,
  nextTurn,
  players,
  GameRoomState,
  ChangeCurrentPlayerAction,
  GoneAction,
  JoinedAction,
  Player,
  SetQuestAction,
  CHANGE_CURRENT_PLAYER,
  GONE,
  JOINED,
  NEXT_PLAYER,
  SET_QUEST,
} from '../store';

// Should occurs when some player enters in the room
function* join(from: string, payload: any, type: string, to?: string) {
  const state: GameRoomState = yield select(gameRoom);
  const isPlayer = state.players.has(from!);

  if (type === 'join' && !isPlayer) {
    const { timestamp } = payload;
    const joinPayload: any = { id: from!, timestamp };
    let peerConnection: PeerConnection | null = null;

    if (from === state.myId) { // my own joining
      yield put<JoinedAction>({ type: JOINED, payload: joinPayload });
      yield PeerConnection.getLocalStream();
      yield put<SetQuestAction>({
        type: SET_QUEST,
        payload: { id: from, quest: Quest.getQuest() },
      });
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
      yield peerConnection.startConnection();

      const imHost = yield select(imHostPlayer);
      if (imHost) {
        yield Api.getInstance().send({
          type: CHANGE_CURRENT_PLAYER,
          payload: { id: state.currentPlayerId },
        });
        const quest = Quest.getQuest();
        yield put<SetQuestAction>({
          type: SET_QUEST,
          payload: { id: from, quest },
        });
        const current = yield select(currentPlayer);
        yield Api.getInstance().send({
          type: SET_QUEST,
          payload: { id: current.id, quest: current.quest },
        });
        for (const player of yield select(players)) {
          yield Api.getInstance().send({
            type: SET_QUEST,
            payload: { id: player.id, quest: player.quest },
          });
        }
      }
    }
  } else if (type === 'gone') {
    yield put<GoneAction>({ type: GONE, payload: { id: from! } });
  }
}

function* changeCurrentPlayer(payload: any) {
  const { id } = payload;
  const imHost = yield select(imHostPlayer);

  if (!imHost) {
    yield put<ChangeCurrentPlayerAction>({
      type: CHANGE_CURRENT_PLAYER,
      payload: { id },
    });
  }
}

function *setQuest(payload: any) {
  const { id, quest } = payload;
  yield put<SetQuestAction>({
    type: SET_QUEST,
    payload: { id, quest },
  });
}

function* onMessage({ payload: { msg: { from, payload, to, type } } }: IncomingMessageAction) {
  if (['join', 'gone'].some(t => type === t)) yield join(from!, payload, type, to);
  if (type === CHANGE_CURRENT_PLAYER) yield changeCurrentPlayer(payload);
  if (type === SET_QUEST) yield setQuest(payload);
}

function* onNextPlayer() {
  const imHost = yield select(imHostPlayer);
  if (imHost) {
    const nextPlayer: Player = yield select(nextTurn);
    yield put<ChangeCurrentPlayerAction>({
      type: CHANGE_CURRENT_PLAYER,
      payload: { id: nextPlayer.id },
    });
    const current: Player = yield select(currentPlayer);
    yield Api.getInstance().send({
      type: CHANGE_CURRENT_PLAYER,
      payload: { id: current.id },
    });
  }}

export function* saga() {
  yield takeEvery(INCOMING_MESSAGE, onMessage);
  yield takeEvery(NEXT_PLAYER, onNextPlayer);
}
