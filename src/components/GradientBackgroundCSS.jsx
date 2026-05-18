import React from 'react';

export default function GradientBackgroundCSS({ variant = 'default' }) {
  const gradients = {
    default: 'radial-gradient(ellipse at 20% 50%, rgba(230,126,34,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(26,26,46,0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(211,84,0,0.1) 0%, transparent 50%)',
    dark: 'radial-gradient(ellipse at 30% 30%, rgba(230,126,34,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(22,33,62,0.2) 0%, transparent 50%)',
    warm: 'radial-gradient(ellipse at 50% 0%, rgba(230,126,34,0.2) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(211,84,0,0.1) 0%, transparent 50%)',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      background: '#0a0a0f',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: '-50%',
        background: gradients[variant] || gradients.default,
        animation: 'rotateGradient 20s linear infinite',
      }} />
      <style>{`
        @keyframes rotateGradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
