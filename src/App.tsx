import { useState } from 'react';
import GroupList from './components/GroupList';
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
        <GroupList />
      </main>
    </div>
  )
}

export default App
