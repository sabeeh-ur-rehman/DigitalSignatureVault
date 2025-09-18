import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  'data-testid'?: string;
}

export default function SignaturePad({ onSignatureChange, 'data-testid': testId }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textSignature, setTextSignature] = useState('');
  const [activeTab, setActiveTab] = useState('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 120;
    
    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to data URL and notify parent
    const dataURL = canvas.toDataURL();
    onSignatureChange(dataURL);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange(null);
  };

  const generateTextSignature = () => {
    if (!textSignature.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text signature
    ctx.font = '24px cursive';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textSignature, canvas.width / 2, canvas.height / 2);

    // Convert to data URL and notify parent
    const dataURL = canvas.toDataURL();
    onSignatureChange(dataURL);
  };

  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" data-testid="tab-draw">Draw</TabsTrigger>
            <TabsTrigger value="type" data-testid="tab-type">Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw">
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  data-testid="canvas-signature"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={clearCanvas} data-testid="button-clear-signature">
                  Clear
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="type">
            <div className="space-y-4">
              <Input
                value={textSignature}
                onChange={(e) => setTextSignature(e.target.value)}
                placeholder="Type your full name"
                className="font-mono"
                data-testid="input-text-signature"
              />
              <Button 
                onClick={generateTextSignature} 
                disabled={!textSignature.trim()}
                className="w-full"
                data-testid="button-generate-text-signature"
              >
                Generate Signature
              </Button>
              {textSignature && (
                <div className="border border-border rounded-lg p-4 bg-white text-center">
                  <span className="text-2xl font-cursive" style={{ fontFamily: 'cursive' }}>
                    {textSignature}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
