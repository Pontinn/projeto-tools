import React, { useRef, useEffect, useCallback } from 'react';

const COLORS_LIGHT = [
  '#e94560', '#0f3460', '#533483', '#f39c12',
  '#f5a623', '#2ecc71', '#3498db', '#9b59b6',
  '#e67e22', '#1abc9c', '#e74c3c', '#2980b9',
];

const COLORS_DARK = [
  '#c0392b', '#2471a3', '#7d3c98', '#117a65',
  '#d68910', '#1e8449', '#1a5276', '#6c3483',
  '#ba4a00', '#148f77', '#943126', '#1f618d',
];

const MIN_ROTATIONS = 5;
const MAX_ROTATIONS = 10;

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

export default function Wheel({ items, theme, onResult, spinning, setSpinning }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    currentAngle: 0,
    targetAngle: 0,
    startAngle: 0,
    startTime: null,
    duration: 5000,
  });

  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  const drawWheel = useCallback(
    (angle) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 8;

      ctx.clearRect(0, 0, size, size);

      if (!items || items.length === 0) {
        ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#e0e0e0';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = theme === 'dark' ? '#aaa' : '#666';
        ctx.font = 'bold 16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Adicione opções', cx, cy);
        return;
      }

      const n = items.length;
      const sliceAngle = (2 * Math.PI) / n;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < n; i++) {
        const startA = angle + i * sliceAngle;
        const endA = startA + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;

        const maxLen = 16;
        let label = items[i].label;
        if (label.length > maxLen) label = label.slice(0, maxLen - 1) + '…';

        const fontSize = n <= 8 ? 14 : n <= 14 ? 12 : 10;
        ctx.font = `bold ${fontSize}px Segoe UI`;
        ctx.fillText(label, radius - 12, 5);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
      ctx.fillStyle = theme === 'dark' ? '#0f0f0f' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 4;
      ctx.stroke();
    },
    [items, theme, colors]
  );

  useEffect(() => {
    drawWheel(stateRef.current.currentAngle);
  }, [drawWheel]);

  function spin() {
    if (spinning || !items || items.length === 0) return;

    const extraRotations =
      (MIN_ROTATIONS + Math.random() * (MAX_ROTATIONS - MIN_ROTATIONS)) * 2 * Math.PI;
    const randomAngle = Math.random() * 2 * Math.PI;

    const s = stateRef.current;
    s.startAngle = s.currentAngle;
    s.targetAngle = s.currentAngle + extraRotations + randomAngle;
    s.startTime = null;
    s.duration = 4000 + Math.random() * 2000;

    setSpinning(true);

    function animate(timestamp) {
      if (!s.startTime) s.startTime = timestamp;
      const elapsed = timestamp - s.startTime;
      const progress = Math.min(elapsed / s.duration, 1);
      const easedProgress = easeOut(progress);

      s.currentAngle = s.startAngle + (s.targetAngle - s.startAngle) * easedProgress;
      drawWheel(s.currentAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        s.currentAngle = s.targetAngle;
        setSpinning(false);

        const n = items.length;
        const sliceAngle = (2 * Math.PI) / n;
        const normalizedAngle =
          (((-s.currentAngle - Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % n;
        onResult(items[winnerIndex]);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const canSpin = items && items.length >= 2;

  return (
    <div className="wheel-container">
      <div className="pointer" />
      <canvas
        ref={canvasRef}
        width={460}
        height={460}
        className={`wheel-canvas ${spinning ? 'spinning' : ''}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <button
        className={`spin-btn ${spinning || !canSpin ? 'disabled' : ''}`}
        onClick={spin}
        disabled={spinning || !canSpin}
      >
        {spinning ? 'Girando...' : canSpin ? 'Girar!' : 'Adicione 2+ opções'}
      </button>
    </div>
  );
}
