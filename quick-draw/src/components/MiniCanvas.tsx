import React, { useEffect, useRef } from 'react';

export default function MiniCanvas({ drawingData }: { drawingData: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 200;
    const height = canvas.parentElement?.clientHeight || 200;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#1f2937';
    
    ctx.lineWidth = width < 100 ? 2 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let strokes = [];
    try {
      strokes = typeof drawingData === 'string' ? JSON.parse(drawingData) : drawingData;
    } catch (e) {
      return;
    }

    if (!strokes || strokes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];
      xCoords.forEach((x: number) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
      yCoords.forEach((y: number) => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    });

    const drawWidth = maxX - minX;
    const drawHeight = maxY - minY;

    const padding = width * 0.15; 
    const scaleX = (width - padding * 2) / (drawWidth || 1);
    const scaleY = (height - padding * 2) / (drawHeight || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - drawWidth * scale) / 2 - minX * scale;
    const offsetY = (height - drawHeight * scale) / 2 - minY * scale;

    strokes.forEach((stroke: any) => {
      const xCoords = stroke[0];
      const yCoords = stroke[1];

      if (xCoords.length > 0) {
        ctx.beginPath();
        ctx.moveTo(xCoords[0] * scale + offsetX, yCoords[0] * scale + offsetY);
        for (let i = 1; i < xCoords.length; i++) {
          ctx.lineTo(xCoords[i] * scale + offsetX, yCoords[i] * scale + offsetY);
        }
        ctx.stroke();
      }
    });
  }, [drawingData]);

  return <canvas ref={canvasRef} className="w-full h-full bg-transparent" />;
}