'use client';

import { Loader2 } from 'lucide-react';
import { generationTips } from '@/lib/constants/generation';

interface GeneratingStateProps {
  imageCount: number;
  elapsedTime: number;
  currentTip: number;
}

export default function GeneratingState({
  imageCount,
  elapsedTime,
  currentTip,
}: GeneratingStateProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          Generando {imageCount} {imageCount === 1 ? 'imagen' : 'imágenes'}...{' '}
          {elapsedTime}s
        </span>
      </div>
      <p className="text-center text-sm text-gray-500">
        Tip: {generationTips[currentTip]}
      </p>
    </div>
  );
}
