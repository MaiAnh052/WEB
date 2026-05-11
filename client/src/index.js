import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {SnackbarProvider} from 'notistack';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import 'antd/dist/antd.css';
import "./styles/global.css";
ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider 
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          borderRadius: 8,
          wireframe: false,
        },
      }}
    >
      <SnackbarProvider maxSnack={3}> 
        <App />
      </SnackbarProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorker.unregister();
