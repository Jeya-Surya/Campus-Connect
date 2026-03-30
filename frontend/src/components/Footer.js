import React from 'react';

export default function Footer({ text }) {
  return (
    <footer className="footer">
      <p>{text || '© 2025 Campus Connect'}</p>
    </footer>
  );
}
