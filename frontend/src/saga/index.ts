import { all, call, spawn } from 'redux-saga/effects';

import sagas from './sagas';

export function* rootSaga () {
  yield all(sagas.map((saga: any) =>
    spawn(function* () {
      while (true) {
        try {
          yield call(saga);
          break;
        } catch (e) {
          console.error(e);
        }
      }
    })
  ));
};
