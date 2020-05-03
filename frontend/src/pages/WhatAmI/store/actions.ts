import { JOIN, JOINED } from './types';

export const joinMe = (id: string, namespace: string) => {
  const now = new Date();
  const utc = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  ); 
  return {
    type: JOIN,
    payload: { id, namespace, timestamp: utc },
  };
};

export const join = (id: string) => ({
  type: JOINED,
  payload: { id },
});
