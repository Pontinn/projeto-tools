import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Wheel from '../components/roleta/Wheel';
import Panel from '../components/roleta/Panel';
import ThemeToggle from '../components/roleta/ThemeToggle';
import Chronometer from '../components/roleta/Chronometer';

const DEFAULT_ITEMS = [
  { id: 1, label: 'Opção 1' },
  { id: 2, label: 'Opção 2' },
  { id: 3, label: 'Opção 3' },
  { id: 4, label: 'Opção 4' },
  { id: 5, label: 'Opção 5' },
  { id: 6, label: 'Opção 6' },
];

function load(key, fallback) {
  try {
    if (typeof window === 'undefined') return fallback;
    const s = localStorage.getItem(key);
    if (s !== null) return JSON.parse(s);
  } catch {}
  return fallback;
}

export default function Roletada() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [theme, setTheme] = useState('dark');
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [eliminatedIds, setEliminatedIds] = useState([]);
  const [showChrono, setShowChrono] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(load('roleta_items', DEFAULT_ITEMS));
    setTheme(load('roleta_theme', 'dark'));
    setEliminationMode(load('roleta_elim_mode', false));
    setEliminatedIds(load('roleta_elim_ids', []));
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem('roleta_theme', JSON.stringify(theme)); }, [theme, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('roleta_items', JSON.stringify(items)); }, [items, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('roleta_elim_mode', JSON.stringify(eliminationMode)); }, [eliminationMode, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('roleta_elim_ids', JSON.stringify(eliminatedIds)); }, [eliminatedIds, mounted]);

  const activeItems = eliminationMode
    ? items.filter(i => !eliminatedIds.includes(i.id))
    : items;

  function handleResult(item) {
    setWinner(item.label);
    if (eliminationMode) {
      setEliminatedIds(prev => [...prev, item.id]);
    }
  }

  function addItem(label) {
    setItems(prev => [...prev, { id: Date.now(), label }]);
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setEliminatedIds(prev => prev.filter(eid => eid !== id));
  }

  function editItem(id, newLabel) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, label: newLabel } : i)));
  }

  function clearAll() {
    if (window.confirm('Remover todas as opções?')) {
      setItems([]);
      setEliminatedIds([]);
      setWinner(null);
    }
  }

  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }

  function toggleEliminationMode() {
    setEliminationMode(prev => !prev);
    setEliminatedIds([]);
    setWinner(null);
  }

  function resetElimination() {
    setEliminatedIds([]);
    setWinner(null);
  }

  return (
    <div className={`roleta-page ${theme}`}>
      <Head>
        <title>Roleta — Pontin.dev TOOLS</title>
        <meta name="description" content="Roleta personalizável com modo eliminação e cronômetro." />
      </Head>

      <div className="roleta-controls-bar">
        <button
          className={`chrono-toggle-btn ${theme} ${showChrono ? 'active' : ''}`}
          onClick={() => setShowChrono(v => !v)}
          title="Abrir / fechar cronômetro"
        >
          ⏱ Cronômetro
        </button>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <main className="roleta-main">
        <section className="wheel-section">
          <Wheel
            items={activeItems}
            theme={theme}
            onResult={handleResult}
            spinning={spinning}
            setSpinning={setSpinning}
          />
          {winner && !spinning && (
            <div className={`winner-banner ${theme}`}>
              <span className="winner-label">Resultado:</span>
              <span className="winner-value">{winner}</span>
              <button className="clear-btn" onClick={() => setWinner(null)}>✕</button>
            </div>
          )}
        </section>

        <section className="panel-section">
          <Panel
            items={items}
            theme={theme}
            onAdd={addItem}
            onRemove={removeItem}
            onEdit={editItem}
            onClearAll={clearAll}
            disabled={spinning}
            eliminationMode={eliminationMode}
            eliminatedIds={eliminatedIds}
            onToggleEliminationMode={toggleEliminationMode}
            onResetElimination={resetElimination}
          />
        </section>

        {showChrono && (
          <section className="chrono-section">
            <Chronometer theme={theme} onClose={() => setShowChrono(false)} />
          </section>
        )}
      </main>
    </div>
  );
}
