import { JOINED, NEXT_PLAYER } from './types';

export const joined = (id: string) => ({
  type: JOINED,
  payload: { id },
});

export const nextPlayer = () => ({ type: NEXT_PLAYER });