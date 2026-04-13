import React, { useState, useRef, useEffect } from 'react';

function formatMs(ms, centis = false) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const cc = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) {
    const hh = String(h).padStart(2, '0');
    return centis ? `${hh}:${mm}:${ss}.${cc}` : `${hh}:${mm}:${ss}`;
  }
  return centis ? `${mm}:${ss}.${cc}` : `${mm}:${ss}`;
}

function loadHistory() {
  try {
    const s = localStorage.getItem('roleta_chrono_history');
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

export default function Chronometer({ theme, onClose }) {
  const [mode, setMode] = useState('stopwatch');

  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState([]);
  const swStartRef = useRef(null);
  const swAccRef = useRef(0);
  const swRafRef = useRef(null);

  const [timerInput, setTimerInput] = useState({ h: 0, m: 5, s: 0 });
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerStartRef = useRef(null);
  const timerAccRef = useRef(0);
  const timerTotalRef = useRef(0);
  const timerRafRef = useRef(null);

  const [history, setHistory] = useState(loadHistory);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('roleta_chrono_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(swRafRef.current);
      cancelAnimationFrame(timerRafRef.current);
    };
  }, []);

  function swTick() {
    setSwElapsed(swAccRef.current + (performance.now() - swStartRef.current));
    swRafRef.current = requestAnimationFrame(swTick);
  }

  function swStart() {
    swStartRef.current = performance.now();
    setSwRunning(true);
    swRafRef.current = requestAnimationFrame(swTick);
  }

  function swPause() {
    cancelAnimationFrame(swRafRef.current);
    swAccRef.current += performance.now() - swStartRef.current;
    setSwRunning(false);
  }

  function swReset() {
    cancelAnimationFrame(swRafRef.current);
    const finalMs = swRunning
      ? Math.round(swAccRef.current + (performance.now() - swStartRef.current))
      : Math.round(swAccRef.current);
    if (finalMs > 500) {
      addHistory({ type: 'stopwatch', date: new Date().toISOString(), totalMs: finalMs, laps: swLaps });
    }
    swAccRef.current = 0;
    setSwElapsed(0);
    setSwRunning(false);
    setSwLaps([]);
  }

  function swLap() {
    if (!swStartRef.current) return;
    const total = Math.round(swAccRef.current + (performance.now() - swStartRef.current));
    setSwLaps(prev => {
      const lastTotal = prev.length > 0 ? prev[prev.length - 1].totalMs : 0;
      return [...prev, { n: prev.length + 1, totalMs: total, splitMs: total - lastTotal }];
    });
  }

  function timerTotalMs() {
    return (timerInput.h * 3600 + timerInput.m * 60 + timerInput.s) * 1000;
  }

  function timerTick() {
    const elapsed = timerAccRef.current + (performance.now() - timerStartRef.current);
    const remaining = Math.max(0, timerTotalRef.current - elapsed);
    setTimerRemaining(remaining);
    if (remaining <= 0) {
      setTimerRunning(false);
      setTimerDone(true);
      addHistory({ type: 'timer', date: new Date().toISOString(), totalMs: timerTotalRef.current, laps: [] });
      playBeep();
      return;
    }
    timerRafRef.current = requestAnimationFrame(timerTick);
  }

  function timerStart() {
    const total = timerTotalMs();
    if (!timerStarted) {
      if (total === 0) return;
      timerTotalRef.current = total;
      timerAccRef.current = 0;
      setTimerRemaining(total);
    }
    timerStartRef.current = performance.now();
    setTimerRunning(true);
    setTimerStarted(true);
    setTimerDone(false);
    timerRafRef.current = requestAnimationFrame(timerTick);
  }

  function timerPause() {
    cancelAnimationFrame(timerRafRef.current);
    timerAccRef.current += performance.now() - timerStartRef.current;
    setTimerRunning(false);
  }

  function timerReset() {
    cancelAnimationFrame(timerRafRef.current);
    timerAccRef.current = 0;
    timerTotalRef.current = 0;
    setTimerRemaining(0);
    setTimerRunning(false);
    setTimerStarted(false);
    setTimerDone(false);
  }

  function addHistory(entry) {
    setHistory(prev => [{ ...entry, id: Date.now() }, ...prev].slice(0, 100));
  }

  function clearHistory() {
    if (window.confirm('Limpar todo o histórico?')) setHistory([]);
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.45;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
      }
    } catch {}
  }

  function numInput(field, val, max) {
    setTimerInput(p => ({ ...p, [field]: Math.min(max, Math.max(0, parseInt(val, 10) || 0)) }));
  }

  const timerDisplay = timerStarted ? timerRemaining : timerTotalMs();

  return (
    <div className={`chrono ${theme}`}>
      <div className="chrono-header-row">
        <h2 className="chrono-title">Cronômetro</h2>
        <button className={`chrono-close ${theme}`} onClick={onClose} title="Fechar">✕</button>
      </div>

      <div className={`chrono-tabs ${theme}`}>
        <button
          className={`chrono-tab ${mode === 'stopwatch' ? 'active' : ''} ${theme}`}
          onClick={() => setMode('stopwatch')}
        >
          Cronômetro
        </button>
        <button
          className={`chrono-tab ${mode === 'timer' ? 'active' : ''} ${theme}`}
          onClick={() => setMode('timer')}
        >
          Timer
        </button>
      </div>

      {mode === 'stopwatch' && (
        <div className="chrono-body">
          <div className={`chrono-display ${theme} ${swRunning ? 'running' : ''}`}>
            {formatMs(swElapsed, true)}
          </div>
          <div className="chrono-btns">
            {swRunning ? (
              <button className="chrono-btn pause" onClick={swPause}>Pausar</button>
            ) : (
              <button className="chrono-btn start" onClick={swStart}>
                {swElapsed > 0 ? 'Retomar' : 'Iniciar'}
              </button>
            )}
            {swRunning && (
              <button className="chrono-btn lap" onClick={swLap}>Volta</button>
            )}
            {swElapsed > 0 && (
              <button className="chrono-btn reset" onClick={swReset}>Resetar</button>
            )}
          </div>
          {swLaps.length > 0 && (
            <div className={`chrono-laps ${theme}`}>
              <div className={`laps-header ${theme}`}>
                <span>#</span><span>Parcial</span><span>Total</span>
              </div>
              {[...swLaps].reverse().map(lap => (
                <div key={lap.n} className={`lap-row ${theme}`}>
                  <span className="lap-n">{lap.n}</span>
                  <span>{formatMs(lap.splitMs, true)}</span>
                  <span>{formatMs(lap.totalMs, true)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'timer' && (
        <div className="chrono-body">
          {!timerStarted ? (
            <div className="timer-inputs">
              <div className="timer-input-group">
                <input type="number" min="0" max="23" className={`timer-num ${theme}`} value={timerInput.h} onChange={e => numInput('h', e.target.value, 23)} />
                <span className="timer-unit">h</span>
              </div>
              <span className="timer-sep">:</span>
              <div className="timer-input-group">
                <input type="number" min="0" max="59" className={`timer-num ${theme}`} value={timerInput.m} onChange={e => numInput('m', e.target.value, 59)} />
                <span className="timer-unit">min</span>
              </div>
              <span className="timer-sep">:</span>
              <div className="timer-input-group">
                <input type="number" min="0" max="59" className={`timer-num ${theme}`} value={timerInput.s} onChange={e => numInput('s', e.target.value, 59)} />
                <span className="timer-unit">seg</span>
              </div>
            </div>
          ) : (
            <div className={`chrono-display ${theme} ${timerRunning ? 'running' : ''} ${timerDone ? 'done' : ''}`}>
              {formatMs(timerDisplay)}
            </div>
          )}

          <div className="chrono-btns">
            {timerDone ? (
              <button className="chrono-btn reset" onClick={timerReset}>Reiniciar</button>
            ) : timerRunning ? (
              <>
                <button className="chrono-btn pause" onClick={timerPause}>Pausar</button>
                <button className="chrono-btn reset" onClick={timerReset}>Resetar</button>
              </>
            ) : (
              <>
                <button className="chrono-btn start" onClick={timerStart} disabled={!timerStarted && timerTotalMs() === 0}>
                  {timerStarted ? 'Retomar' : 'Iniciar'}
                </button>
                {timerStarted && (
                  <button className="chrono-btn reset" onClick={timerReset}>Resetar</button>
                )}
              </>
            )}
          </div>

          {timerDone && <div className="timer-done-msg">Tempo esgotado!</div>}
        </div>
      )}

      <button className={`history-toggle ${theme}`} onClick={() => setShowHistory(v => !v)}>
        Histórico ({history.length}) {showHistory ? '▲' : '▼'}
      </button>

      {showHistory && (
        <div className={`chrono-history ${theme}`}>
          {history.length === 0 ? (
            <p className="chrono-history-empty">Nenhum registro ainda.</p>
          ) : (
            <>
              <ul className="chrono-history-list">
                {history.map(entry => (
                  <li key={entry.id} className={`history-entry ${theme}`}>
                    <span className="history-icon">{entry.type === 'stopwatch' ? '⏱' : '⏳'}</span>
                    <div className="history-info">
                      <span className="history-time">{formatMs(entry.totalMs, entry.type === 'stopwatch')}</span>
                      <span className="history-date">{new Date(entry.date).toLocaleString('pt-BR')}</span>
                    </div>
                    {entry.laps && entry.laps.length > 0 && (
                      <span className="history-laps">{entry.laps.length} volta{entry.laps.length !== 1 ? 's' : ''}</span>
                    )}
                  </li>
                ))}
              </ul>
              <button className={`clear-history-btn ${theme}`} onClick={clearHistory}>
                Limpar histórico
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
