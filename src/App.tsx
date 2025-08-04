import { useState, useEffect, useRef } from 'react';
import GroupList from './components/GroupList';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Toast from '@radix-ui/react-toast';

function App() {
  const [count, setCount] = useState(0)
  const [openToast, setOpenToast] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="App">
      <main className="App-content">
        <GroupList />
      </main>

      <Toast.Provider swipeDirection="right">
        <Toast.Root className="ToastRoot" open={openToast} onOpenChange={setOpenToast}>
          <Toast.Title className="ToastTitle">Heads up!</Toast.Title>
          <Toast.Description asChild>
            <p>This is a toast notification.</p>
          </Toast.Description>
          <Toast.Action className="ToastAction" asChild altText="Goto schedule to undo">
            <button className="Button vanilla">Undo</button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </div>
  )
}

export default App
