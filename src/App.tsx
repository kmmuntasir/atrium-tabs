import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Atrium Tabs</h1>
      </header>
      <main className="App-content">
        <div className="group-list-placeholder">
          {/* Placeholder for group list */}
          <p>Your groups will appear here.</p>
        </div>
      </main>
    </div>
  )
}

export default App
