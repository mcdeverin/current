import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { Capacitor } from '@capacitor/core'
import { restoreTokenFromKeychain } from '@/lib/secure-token'

if (Capacitor.isNativePlatform()) {
  restoreTokenFromKeychain();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)