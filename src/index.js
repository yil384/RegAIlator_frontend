import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

// third party
import { Provider } from 'react-redux';

// project imports
import configureStore from './store';
import * as serviceWorker from './serviceWorker';
import App from './App';

import config from './configs';
import LoaderBackdrop from './ui-component/LoaderBackdrop';

// style + assets
import './assets/scss/style.scss';

const { store, persistor } = configureStore();

//-----------------------|| REACT DOM RENDER  ||-----------------------//
const render = () => {
    ReactDOM.render(
        <Provider store={store}>
            <PersistGate loading={<LoaderBackdrop isLoading />} persistor={persistor}>
                <BrowserRouter basename={config.basename}>
                    <App />
                </BrowserRouter>
            </PersistGate>
        </Provider>,
        document.getElementById('root')
    );
};

render();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
