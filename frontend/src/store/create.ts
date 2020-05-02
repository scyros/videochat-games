import { applyMiddleware, createStore as reduxCreateStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { rootReducer } from './reducer';
import { rootSaga } from '../saga';

export function createStore() {
  const composeEnhancers: Function =
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' as any] as any ||
    compose;
  const sagaMiddleware = createSagaMiddleware();
  const store = reduxCreateStore(
    rootReducer,
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );

  sagaMiddleware.run(rootSaga);

  return store;
}
