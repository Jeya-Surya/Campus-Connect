import React from 'react';

export default function Header({ title, actions = [], onToggleTheme, themeLabel }) {
  return (
    <header className="app-header">
      <h1>{title}</h1>
      <div className="header-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`header-btn ${action.variant || ''}`.trim()}
            type="button"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
        {onToggleTheme && (
          <button className="header-btn" type="button" onClick={onToggleTheme}>
            {themeLabel}
          </button>
        )}
      </div>
    </header>
  );
}
