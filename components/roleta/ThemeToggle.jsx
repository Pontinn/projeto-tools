import React from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={onToggle}
      title={theme === 'light' ? 'Modo noturno' : 'Modo claro'}
      aria-label="Alternar tema"
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-icon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
