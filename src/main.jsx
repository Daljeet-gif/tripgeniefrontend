import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { TripProvider } from './context/TripContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <TripProvider>
    <App />
    </TripProvider>
  </BrowserRouter>,
)
