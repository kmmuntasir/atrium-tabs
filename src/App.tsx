import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './vite.svg';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { Button } from '@radix-ui/themes';
import StorageToast from './components/StorageToast';
import StorageModal from './components/StorageModal';
import CorruptionModal from './components/CorruptionModal';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Toaster position="bottom-center" />
      <StorageToast />
      <StorageModal />
      <CorruptionModal />
    </>
  );
}

export default App;
