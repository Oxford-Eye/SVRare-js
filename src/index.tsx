import * as React from 'react';
import 'jquery';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
// React.StrictMode causes double-call on components
root.render(
  <App />
);
registerServiceWorker();