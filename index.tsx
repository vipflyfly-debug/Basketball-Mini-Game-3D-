import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// @ts-ignore: The 'document' global is available in browser environments. This error suggests 'dom' might be missing from the 'lib' compiler option in tsconfig.json.
const rootElement = (document as any).getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);