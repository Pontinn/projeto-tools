import React, { useState } from 'react';

export default function Panel({
  items, theme, onAdd, onRemove, onEdit, onClearAll, disabled,
  eliminationMode, eliminatedIds, onToggleEliminationMode, onResetElimination,
}) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput('');
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditValue(item.label);
  }

  function commitEdit(id) {
    const trimmed = editValue.trim();
    if (trimmed) onEdit(id, trimmed);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEditKey(e, id) {
    if (e.key === 'Enter') commitEdit(id);
    if (e.key === 'Escape') cancelEdit();
  }

  const activeCount = items.length - eliminatedIds.length;

  return (
    <div className={`panel ${theme}`}>
      <div className="panel-header-row">
        <h2 className="panel-title">Opções</h2>
        {items.length > 0 && (
          <button className={`clear-all-btn ${theme}`} onClick={onClearAll} disabled={disabled}>
            Limpar tudo
          </button>
        )}
      </div>

      <p className="panel-count">
        {eliminationMode
          ? `${activeCount} ativa${activeCount !== 1 ? 's' : ''} / ${eliminatedIds.length} eliminada${eliminatedIds.length !== 1 ? 's' : ''}`
          : `${items.length} opção${items.length !== 1 ? 'ões' : ''}`}
      </p>

      <div className={`mode-row ${theme}`}>
        <button
          className={`mode-btn ${!eliminationMode ? 'active' : ''} ${theme}`}
          onClick={() => eliminationMode && onToggleEliminationMode()}
          disabled={disabled}
        >
          Repetição livre
        </button>
        <button
          className={`mode-btn ${eliminationMode ? 'active elimination' : ''} ${theme}`}
          onClick={() => !eliminationMode && onToggleEliminationMode()}
          disabled={disabled}
        >
          Eliminação
        </button>
      </div>

      {eliminationMode && eliminatedIds.length > 0 && (
        <button className={`reset-elim-btn ${theme}`} onClick={onResetElimination} disabled={disabled}>
          Resetar eliminações ({eliminatedIds.length})
        </button>
      )}

      <form className="add-form" onSubmit={handleAdd}>
        <input
          className={`add-input ${theme}`}
          type="text"
          placeholder="Nova opção..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={40}
          disabled={disabled}
        />
        <button className="add-btn" type="submit" disabled={disabled || !input.trim()}>
          Adicionar
        </button>
      </form>

      <ul className="items-list">
        {items.length === 0 && (
          <li className={`empty-msg ${theme}`}>Nenhuma opção. Adicione acima.</li>
        )}
        {items.map((item, index) => {
          const isEliminated = eliminatedIds.includes(item.id);
          return (
            <li key={item.id} className={`item-row ${theme} ${isEliminated ? 'eliminated' : ''}`}>
              <span className="item-index">{index + 1}</span>

              {editingId === item.id ? (
                <input
                  className={`edit-input ${theme}`}
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(item.id)}
                  onKeyDown={e => handleEditKey(e, item.id)}
                  maxLength={40}
                />
              ) : (
                <span
                  className={`item-label ${isEliminated ? 'strikethrough' : ''}`}
                  onDoubleClick={() => !disabled && !isEliminated && startEdit(item)}
                  title={isEliminated ? 'Eliminada' : 'Clique duplo para editar'}
                >
                  {item.label}
                  {isEliminated && <span className="elim-tag">eliminada</span>}
                </span>
              )}

              <div className="item-actions">
                {editingId === item.id ? (
                  <>
                    <button className="action-btn save" onClick={() => commitEdit(item.id)} title="Salvar">✓</button>
                    <button className="action-btn cancel" onClick={cancelEdit} title="Cancelar">✕</button>
                  </>
                ) : (
                  <>
                    <button
                      className="action-btn edit"
                      onClick={() => startEdit(item)}
                      disabled={disabled || isEliminated}
                      title="Editar"
                    >✎</button>
                    <button
                      className="action-btn remove"
                      onClick={() => onRemove(item.id)}
                      disabled={disabled}
                      title="Remover"
                    >✕</button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
