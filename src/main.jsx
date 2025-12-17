import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './context/UserContext'
import { NotesProvider } from './context/NotesContext'
import { ThemeProvider } from './context/ThemeContext'
import { UIProvider } from './context/UIContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <NotesProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </NotesProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
