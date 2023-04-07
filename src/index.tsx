import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { CONFIGURE_VNT } from './utils/constants';
import { ThemeProvider } from "@mui/material/styles";
import theme from './assets/theme/theme';


const app = () => {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
};
declare global {
  interface Window {
    vntInit: any;
  }
}
const destinationName = () => {
  if (process.env.REACT_APP_NODE_ENV === 'development') {
    return 'dev/chat-widget-tickets.css';
  } else if (process.env.REACT_APP_NODE_ENV === 'stage') {
    return 'stage/chat-widget-tickets.css';
  }
  else if (process.env.REACT_APP_NODE_ENV === 'production') {
    return 'prod/chat-widget-tickets.css';
  }
};
const init = () => {
  const head = document.head || document.getElementsByTagName('head')[0];
  if (window.vntInit) {
    let _config = window?.vntInit() || {};
    localStorage.setItem(CONFIGURE_VNT, JSON.stringify(_config));
  }
  // Create new link Element
  let linkCss = document.createElement('link');
  let d = new Date();
  let n = d.getTime();
  // set the attributes for link element
  linkCss.rel = 'stylesheet';
  linkCss.type = 'text/css';
  linkCss.href = `https://storage.googleapis.com/mkt-sdk/${destinationName()}?version=${n}`;
  head.appendChild(linkCss);
  const _dom = document.createElement('div');
  _dom.style.position = 'fixed';
  _dom.style.zIndex = '9999';
  _dom.style.top = 'auto';
  _dom.style.bottom = '0';
  _dom.style.right = '0';
  _dom.setAttribute('id', 'vnt-chat-widget-tickets');
  ReactDOM.render(app(), document.body.appendChild(_dom));
};

init();
