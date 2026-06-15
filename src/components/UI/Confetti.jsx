import React, { useEffect, useState } from 'react';

const colors = ['#4CAF50', '#FF9800', '#2196F3', '#FFC107', '#9C27B0', '#E91E63', '#00BCD4'];

const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      // Generate 80 random confetti particles
      const newParticles = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: `${Math.random() * 6 + 6}px`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.random() * 2 + 2}s`,
        isRound: Math.random() > 0.5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.isRound ? '50%' : '0%',
            animationDelay: p.delay,
            animationDuration: p.duration,
            top: '-20px',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
