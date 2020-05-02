import axios, { AxiosInstance } from 'axios';
import { Action } from 'redux';
import { eventChannel, END } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';

import { JOIN } from '../../pages/WhatAmI/store';

export const INCOMING_MESSAGE = 'API_INCOMING_MESSAGE';
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
      baseURL: process.env.REACT_APP_API_HOST,
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
    const { payload: { id, namespace: ns } } = yield take(JOIN);

    this.id = id;
    this.namespace = ns;

    const channel = yield call(() => eventChannel((emitter) => {
      const source = new EventSource(`${process.env.REACT_APP_API_EVENTS}?id=${id}&ns=${ns}`);
      
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
