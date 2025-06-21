'use client';

import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';

interface ColorPaletteDisplayProps {
  paletteName: string;
  description: string;
  colors: string[];
}

export function ColorPaletteDisplay({ paletteName, description, colors }: ColorPaletteDisplayProps) {
  const { toast } = useToast();

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: 'Copied to clipboard!',
      description: `Color ${color} is now in your clipboard.`,
    });
  };

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{paletteName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleCopy(color)}
              className="group flex w-full items-center justify-between gap-4 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
              aria-label={`Copy color ${color}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-sm">{color}</span>
              </div>
              <Copy className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
