import { useEffect, useRef } from 'react';

const SimpleChart = ({ data, type = 'line', color = '#7c3aed' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 20;

    ctx.clearRect(0, 0, width, height);

    if (type === 'line') {
      const max = Math.max(...data.map(d => d.value)) * 1.2;
      const stepX = (width - padding * 2) / (data.length - 1);

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');

      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (point.value / max) * (height - padding * 2);
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = padding + (i - 1) * stepX;
          const prevY = height - padding - (data[i - 1].value / max) * (height - padding * 2);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(width - padding, height - padding);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (point.value / max) * (height - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = padding + (i - 1) * stepX;
          const prevY = height - padding - (data[i - 1].value / max) * (height - padding * 2);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Points
      data.forEach((point, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (point.value / max) * (height - padding * 2);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } else if (type === 'bar') {
      const max = Math.max(...data.map(d => d.value)) * 1.2;
      const barWidth = (width - padding * 2) / data.length * 0.6;
      const stepX = (width - padding * 2) / data.length;

      data.forEach((point, i) => {
        const x = padding + i * stepX + (stepX - barWidth) / 2;
        const barHeight = (point.value / max) * (height - padding * 2);
        const y = height - padding - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      });
    }
  }, [data, type, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default SimpleChart;