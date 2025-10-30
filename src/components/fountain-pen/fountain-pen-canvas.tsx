'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Download } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  pressure: number;
}

export function FountainPenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Deep blue ink
  const [nibSize, setNibSize] = useState(3);
  const [inkFlow, setInkFlow] = useState(0.7);
  const lastPointRef = useRef<Point | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const calculatePressure = (currentX: number, currentY: number, lastPoint: Point | null): number => {
    if (!lastPoint) return 0.5;

    const currentTime = Date.now();
    const timeDelta = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Calculate speed (distance / time)
    const dx = currentX - lastPoint.x;
    const dy = currentY - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = timeDelta > 0 ? distance / timeDelta : 0;

    // Slower movement = more ink (higher pressure)
    // Map speed to pressure (inverse relationship)
    const pressure = Math.max(0.3, Math.min(1.0, 1.0 - speed * 2));

    return pressure;
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(distance / 2));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t;
      const pressure = from.pressure + (to.pressure - from.pressure) * t;

      // Calculate line width based on pressure, nib size, and ink flow
      const baseWidth = nibSize * pressure * inkFlow;
      const width = baseWidth + Math.random() * 0.5; // Add slight variation

      // Draw ink splatter/texture for realism
      const alpha = 0.15 + (pressure * 0.2 * inkFlow);

      // Main stroke
      ctx.beginPath();
      ctx.arc(x, y, width / 2, 0, Math.PI * 2);
      ctx.fillStyle = inkColor;
      ctx.fill();

      // Add ink bleeding effect for fountain pen realism
      if (pressure > 0.6 && inkFlow > 0.5) {
        ctx.beginPath();
        ctx.arc(x + Math.random() * 2 - 1, y + Math.random() * 2 - 1, width / 3, 0, Math.PI * 2);
        ctx.fillStyle = inkColor + '40'; // Semi-transparent
        ctx.fill();
      }

      // Occasional ink pooling
      if (Math.random() < 0.05 * inkFlow && pressure > 0.7) {
        ctx.beginPath();
        ctx.arc(x, y, width * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = inkColor + '30';
        ctx.fill();
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y, pressure: 0.5 };
    lastTimeRef.current = Date.now();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pressure = calculatePressure(x, y, lastPointRef.current);
    const currentPoint = { x, y, pressure };

    if (lastPointRef.current) {
      drawStroke(ctx, lastPointRef.current, currentPoint);
    }

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `fountain-pen-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white shadow-inner"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={clearCanvas} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>
            <Button onClick={downloadCanvas} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pen Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ink Color */}
          <div className="space-y-2">
            <Label htmlFor="inkColor">Ink Color</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { name: 'Royal Blue', color: '#1e3a8a' },
                { name: 'Black', color: '#000000' },
                { name: 'Midnight Blue', color: '#1e40af' },
                { name: 'Dark Green', color: '#065f46' },
                { name: 'Burgundy', color: '#7f1d1d' },
                { name: 'Brown', color: '#78350f' },
                { name: 'Purple', color: '#581c87' },
                { name: 'Teal', color: '#115e59' },
              ].map((ink) => (
                <button
                  key={ink.color}
                  onClick={() => setInkColor(ink.color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    inkColor === ink.color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: ink.color }}
                  title={ink.name}
                />
              ))}
              <input
                type="color"
                id="inkColor"
                value={inkColor}
                onChange={(e) => setInkColor(e.target.value)}
                className="w-12 h-12 rounded-full border-2 border-gray-300 cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Nib Size */}
          <div className="space-y-2">
            <Label htmlFor="nibSize">Nib Size: {nibSize.toFixed(1)}mm</Label>
            <input
              type="range"
              id="nibSize"
              min="1"
              max="8"
              step="0.5"
              value={nibSize}
              onChange={(e) => setNibSize(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Extra Fine</span>
              <span>Fine</span>
              <span>Medium</span>
              <span>Broad</span>
            </div>
          </div>

          {/* Ink Flow */}
          <div className="space-y-2">
            <Label htmlFor="inkFlow">Ink Flow: {(inkFlow * 100).toFixed(0)}%</Label>
            <input
              type="range"
              id="inkFlow"
              min="0.3"
              max="1"
              step="0.1"
              value={inkFlow}
              onChange={(e) => setInkFlow(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Dry</span>
              <span>Medium</span>
              <span>Wet</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="h-16 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <div
                className="rounded-full transition-all"
                style={{
                  width: `${nibSize * 4}px`,
                  height: `${nibSize * 4}px`,
                  backgroundColor: inkColor,
                  opacity: 0.7 + inkFlow * 0.3,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
