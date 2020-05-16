import axios, { AxiosInstance } from 'axios';
import { Action } from 'redux';
import { eventChannel, END } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';

export const CONNECT = 'API_CONNECT';
export const INCOMING_MESSAGE = 'API_INCOMING_MESSAGE';

export interface ConnectAction extends Action<typeof CONNECT> {
  payload: {
    id: string;
    namespace: string;
  }
}
export interface IncomingMessageAction extends Action<typeof INCOMING_MESSAGE> {
  payload: { msg: Message };
}

export interface Message {
  from?: string;
  namespace?: string;
  payload?: any;
  to?: string;
  type: string;
}

export class Api {
  private static instance: Api | null = null;

  private axiosInstance: AxiosInstance;
  private id: string = '';
  private namespace: string = '';

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.saga = this.saga.bind(this);
  }

  static getInstance() {
    if (!this.instance) this.instance = new Api();
    return this.instance;
  }

  * saga() {
    const { payload: { id, namespace: ns } }: ConnectAction = yield take(CONNECT);

    this.id = id;
    this.namespace = ns;

    const channel = yield call(() => eventChannel((emitter) => {
      const source = new EventSource(`/api/v1/events?id=${id}&ns=${ns}`);
      
      source.onmessage = ({ data }: MessageEvent) => {
        try {
          const msg: Message = JSON.parse(data);
          emitter(msg);
        } catch (e) {
          console.error(e);
        }
      };

      source.onerror = () => {
        if (source.readyState === EventSource.CLOSED) {
          emitter(END)
        }
      };

      return () => source.close();
    }));

    try {
      while (true) {
        const msg = yield take(channel);
        yield put<IncomingMessageAction>({
          type: INCOMING_MESSAGE,
          payload: { msg },
        });
      }
    } catch (e) { console.error(e); }
  }

  connect(id: string, namespace: string) {
    return {
      type: CONNECT,
      payload: { id, namespace },
    };
  }

  async send(msg: Message) {
    try {
      const message: Message = { ...msg, from: this.id };
      await this.axiosInstance.request({
        url: '/',
        method: 'POST',
        data: JSON.stringify({
          ...message,
          ns: this.namespace,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }
}
