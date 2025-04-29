// src/App.tsx
import React from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Chess App</h1>
      <ChessBoard />
    </div>
  );
};

export default App;
