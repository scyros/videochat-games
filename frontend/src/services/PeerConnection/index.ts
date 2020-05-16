import { Action, Dispatch } from 'redux';
import { put, takeEvery } from 'redux-saga/effects';

import { Api, IncomingMessageAction, INCOMING_MESSAGE } from '../Api';

export const LOCALSTREAM_AVAILABLE = 'LOCALSTREAM_AVAILABLE';
export const REMOTESTREAM_AVAILABLE = 'REMOTESTREAM_AVAILABLE';
export const REMOTESTREAM_UNAVAILABLE = 'REMOTESTREAM_UNAVAILABLE';

export interface LocalStreamAvailableAction
  extends Action<typeof LOCALSTREAM_AVAILABLE> {
    payload: { stream: MediaStream };
  }
export interface RemoteStreamAvailableAction
  extends Action<typeof REMOTESTREAM_AVAILABLE> {
    payload: { id: string; stream: MediaStream };
  }
export interface RemoteStreamUnavailableAction
  extends Action<typeof REMOTESTREAM_UNAVAILABLE> {
    payload: { id: string };
  }

export enum MessagesTypes {
  ANSWER = 'rtc:answer',
  NEW_ICE_CANDIDATE = 'rtc:newICECandidate',
  OFFER = 'rtc:offer',
}
export const AllowedMessagesTypes = [
  MessagesTypes.ANSWER,
  MessagesTypes.NEW_ICE_CANDIDATE,
  MessagesTypes.OFFER,
]

export class PeerConnection {
  private static _localStream: MediaStream | null = null;
  private static _dispatch: Dispatch;
  private static connections: Map<string, PeerConnection> = new Map();

  private localId: string;
  private pc: RTCPeerConnection;
  private remoteId: string;
  private started: boolean = false;

  private static * onApiMessage({ payload: { msg } }: IncomingMessageAction) {
    if (!AllowedMessagesTypes.some(t => msg.type === t)) return;

    const { from, payload, type } = msg;
    const peerConnection = Array.from(PeerConnection.connections.values())
      .filter(p => p.remoteId === from)[0];
    if (!peerConnection) {
      console.warn(`Player ${from} is sending a message of type ${type} and has no peer connection.`);
      return;
    }

    if (type === MessagesTypes.NEW_ICE_CANDIDATE)
      yield PeerConnection.onNewICECandidate(peerConnection, payload);
    
    if (type === MessagesTypes.OFFER)
      yield PeerConnection.onOffer(peerConnection, from!, payload);
    
    if (type === MessagesTypes.ANSWER)
      yield PeerConnection.onAnswer(peerConnection, payload);
  }

  private static * onAnswer(pc: PeerConnection, payload: any) {
    try {
      const { description } = payload;
      yield pc.pc.setRemoteDescription(description);
    } catch (e) {
      console.error(e);
    }
  }

  private static * onNewICECandidate(pc: PeerConnection, payload: any) {
    try {
      const { candidate } = payload;
      yield pc.pc.addIceCandidate(candidate);
    } catch (e) {
      console.error(e);
    }
  }

  private static * onOffer(pc: PeerConnection, from: string, payload: any) {
    try {
      const { description } = payload;
      if (pc.pc.signalingState !== 'stable') {
        yield pc.pc.setLocalDescription({ type: 'rollback' });
      }
      yield pc.pc.setRemoteDescription(description);

      yield pc.pc.setLocalDescription(yield pc.pc.createAnswer());
      yield Api.getInstance().send({
        type: MessagesTypes.ANSWER,
        to: from,
        payload: { description: pc.pc.localDescription },
      });

      yield pc.startConnection();
    } catch (e) {
      console.error(e);
    }
  }

  private constructor(localId: string, remoteId: string) {
    this.localId = localId;
    this.remoteId = remoteId;

    this.pc = new RTCPeerConnection({
      iceServers: [{
        urls: ['stun:stun.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
      }],
    });

    this.pc.onicecandidate = this.onICECandidate.bind(this);
    this.pc.oniceconnectionstatechange = this.onICEConnectionStateChange.bind(this);
    this.pc.onconnectionstatechange = this.onConnectionStateChange.bind(this);
    this.pc.ontrack = this.onTrack.bind(this);
  }

  private async onICECandidate({ candidate }: RTCPeerConnectionIceEvent) {
    if (candidate) {
      await Api.getInstance().send({
        type: MessagesTypes.NEW_ICE_CANDIDATE,
        to: this.remoteId,
        payload: { candidate },
      });
    }
  }

  private onICEConnectionStateChange() {
    switch (this.pc.iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.close();
        break;
    }
  }

  private onConnectionStateChange() {
    switch (this.pc.connectionState) {
      case 'closed':
        this.close();
        break;
    }
  }

  private onTrack({ streams }: RTCTrackEvent) {
    PeerConnection._dispatch({
      type: REMOTESTREAM_AVAILABLE,
      payload: { id: this.remoteId, stream: streams[0] },
    });
  }

  public static * getLocalStream() {
    if (!this._localStream) {
      try {
        const constrains: MediaStreamConstraints = {
          audio: true,
          video: { aspectRatio: 1 },
        };
        this._localStream = yield navigator.mediaDevices.getUserMedia(constrains);
        if (this._localStream) {
          yield put<LocalStreamAvailableAction>({
            type: LOCALSTREAM_AVAILABLE,
            payload: { stream: this._localStream },
          });
        } else {
          throw new Error('No local stream available');
        }
      } catch (e) {
        console.error(e);
        this._localStream = null;
      }
    }

    return this._localStream;
  }

  public static setDispatch(dispatch: Dispatch) {
    this._dispatch = dispatch;
  }

  public static getConnection(localId: string, remoteId: string) {
    const peerConnection = new PeerConnection(localId, remoteId);
    if (!this.connections.has(remoteId)) {
      this.connections.set(remoteId, peerConnection);
    }
    return peerConnection;
  }

  public static * saga() {
    yield takeEvery(INCOMING_MESSAGE, PeerConnection.onApiMessage);
  }

  public * startConnection() {
    if (this.started) return;

    const localStream: MediaStream = yield PeerConnection.getLocalStream();
    localStream.getTracks()
      .forEach(t => this.pc.addTrack(t, localStream));

    if (this.pc.signalingState !== 'stable') {
      yield this.pc.setLocalDescription({ type: 'rollback' });
    }

    yield this.pc.setLocalDescription(yield this.pc.createOffer());
    yield Api.getInstance().send({
      type: MessagesTypes.OFFER,
      to: this.remoteId,
      payload: { description: this.pc.localDescription },
    });
    this.started = true;
  }

  public close(noDispatch: boolean = false) {
    this.pc.onicecandidate = null;
    this.pc.oniceconnectionstatechange = null;
    this.pc.onnegotiationneeded = null;
    this.pc.onconnectionstatechange = null;
    this.pc.ontrack = null;
    this.pc.close();

    if (!noDispatch) {
      PeerConnection._dispatch({
        type: REMOTESTREAM_UNAVAILABLE,
        payload: { id: this.remoteId },
      });
    }
    PeerConnection.connections.delete(this.remoteId);
  }
}