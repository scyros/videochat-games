import { JOINED } from './types';

export const joined = (id: string) => ({
  type: JOINED,
  payload: { id },
});
