import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import LoadingPage from './components/loading/LoadingPage';
import { PersistGate } from 'redux-persist/integration/react';
import reduxStore, { persistor } from './redux/storage/store';
import ErrorBoundary from './components/orther/error/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={reduxStore.store}>
      <PersistGate
        loading={<LoadingPage loading={true} />}
        persistor={persistor}
      >
        <BrowserRouter>
          <Suspense fallback={<LoadingPage loading={true} />}>
            <ErrorBoundary>
              <ToastContainer />
              <App />
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
