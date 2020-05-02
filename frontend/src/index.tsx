import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import * as serviceWorker from './serviceWorker';
import { createStore } from './store';
import App from './App';

const store = createStore();

render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
serviceWorker.unregister();
