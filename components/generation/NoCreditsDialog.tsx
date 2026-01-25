'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { WHATSAPP_NUMBER } from '@/lib/constants/generation';

interface NoCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NoCreditsDialog({
  open,
  onOpenChange,
}: NoCreditsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <MessageCircle className="h-6 w-6 text-gray-600" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-center text-base">
              Créditos insuficientes
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Recargá tus créditos para continuar.
            </DialogDescription>
          </div>
          <div className="flex w-full gap-2 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                window.open(
                  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quiero recargar créditos')}`,
                  '_blank',
                );
              }}
              size="sm"
              className="flex-1 gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
