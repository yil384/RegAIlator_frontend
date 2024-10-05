import { createBrowserHistory } from 'history';
import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import createSagaMiddleware from 'redux-saga';

import rootSaga from './sagas';
import createRootReducer from './reducer';
import config from './../configs';

export const history = createBrowserHistory();

//-----------------------|| REDUX - MAIN STORE ||-----------------------//
export default function configureStore(preloadedState) {

  const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['usersReducer'] // navigation will not be persisted
  }

  const rootReducer = createRootReducer(history);
  const persistedReducer = persistReducer(persistConfig, rootReducer);


  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [sagaMiddleware];

  if (config.env === `dev`) {
    const { logger } = require(`redux-logger`);

    middlewares.push(logger);
  }

  const store = createStore(
    persistedReducer,
    preloadedState,
    compose(
      applyMiddleware(...middlewares),
    ),
  );

  const persistor = persistStore(store)

  // then run the saga
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}
