import ReactDOM from 'react-dom/client';
import './styles/CustomBootstrap.scss'
import './styles/index.scss'
import reportWebVitals from './reportWebVitals';
import { router } from './router';
import { RouterProvider } from 'react-router-dom'
import store from './redux';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

reportWebVitals();
