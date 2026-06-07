import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/globals.css'
import { Capacitor } from '@capacitor/core'
import { restoreTokenFromKeychain } from '@/lib/secure-token'

if (Capacitor.isNativePlatform()) {
  restoreTokenFromKeychain();
  import('@capacitor/keyboard').then(({ Keyboard, KeyboardResize }) => {
    Keyboard.setResizeMode({ mode: KeyboardResize.Ionic });
    Keyboard.setScroll({ isDisabled: false });
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
