"use client"

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { SendTokenForm } from './SendTokenForm';
import type { TokenWithChainInfo } from '@/types/crossWallet';
import { cn } from '@/lib/utils';

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenWithChainInfo | null;
  className?: string;
}

export function SendTokenModal({
  isOpen,
  onClose,
  token,
  className = ""
}: SendTokenModalProps) {
  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md w-full max-h-[90vh] overflow-hidden", className)}>
        <SendTokenForm
          token={token}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export default SendTokenModal;