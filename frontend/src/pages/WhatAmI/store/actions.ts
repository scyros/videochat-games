import { JOIN, JOINED } from './types';

export const joinMe = (id: string, namespace: string) => ({
  type: JOIN,
  payload: { id, namespace },
});

export const join = (id: string) => ({
  type: JOINED,
  payload: { id },
});
