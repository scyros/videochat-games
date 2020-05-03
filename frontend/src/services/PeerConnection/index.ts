import { Action } from 'redux';

export const LOCALSTREAM_AVAILABLE = 'LOCALSTREAM_AVAILABLE';
export interface LocalStreamAvailableAction
  extends Action<typeof LOCALSTREAM_AVAILABLE> {
    payload: { stream: MediaStream };
  }

export class PeerConnection {
  private static _localStream: MediaStream | null = null;

  public static get localStream() {
    return (async () => {
      if (!this._localStream) {
        try {
          const constrains: MediaStreamConstraints = {
            video: { aspectRatio: 1 },
          };
          this._localStream = await navigator.mediaDevices.getUserMedia(constrains);
        } catch (e) {
          console.error(e);
          this._localStream = null;
        }
      }

      return this._localStream;
    })();
  }
}