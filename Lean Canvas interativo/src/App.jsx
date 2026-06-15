import React, { useState } from 'react'
import LeanCanvas from './components/LeanCanvas'
import LandingPage from './components/LandingPage'

function App() {
  const [started, setStarted] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('teamId');
  });
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      setStarted(true);
    }, 800); // Matches CSS animation duration
  };

  const params = new URLSearchParams(window.location.search);
  const teamId = params.get('teamId');

  return (
    <div className="min-h-screen bg-slate-900 selection:bg-brutal-indigo selection:text-white">
      {!started ? (
        <LandingPage onStart={handleStart} isExiting={isExiting} />
      ) : (
        <LeanCanvas teamId={teamId} />
      )}
    </div>
  )
}

export default App
