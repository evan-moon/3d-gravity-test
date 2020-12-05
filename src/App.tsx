import React, { useEffect, useRef } from 'react';
import './App.css';
import { Scene } from './lib/Scene';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current != null) {
      const target = ref.current;
      new Scene(target);
    }
  }, []);
  return <div ref={ref} />;
}

export default App;
