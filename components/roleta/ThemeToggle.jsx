import React from 'react';
import { Sun, Moon } from 'lucide-react';

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
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </span>
    </button>
  );
}
