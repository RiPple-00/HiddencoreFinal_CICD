import React, { StrictMode } from 'react'
import ReactDOM  from 'react-dom/client' // HTML.DOM에 연결
import {BrowserRouter} from 'react-router-dom'; // 페이지라우팅
import { Toaster } from 'react-hot-toast'; // 실제 화면에 표시되는 공간 
import { AuthProvider } from './contexts/AutoContext.jsx';
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <App />
    <Toaster
    position='top-right' // 화면 우측상단
    toastOptions={
      {duration: 3000, // 3초 후에 자동으로 소멸
      style:{
        background: '#333',
        color: '#fff',
      },
    }}

    />
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
