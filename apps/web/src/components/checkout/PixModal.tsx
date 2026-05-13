'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixCode: string;
  amount: number;
}

export function PixModal({ isOpen, onClose, pixCode, amount }: PixModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="liquid-glass w-full max-w-sm rounded-[2.5rem] p-8 text-center"
          >
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Total a pagar</p>
              <p className="text-white text-3xl font-bold">R$ {amount.toFixed(2)}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-inner">
               <QRCodeSVG value={pixCode} size={200} />
            </div>

            <div className="mb-8">
              <p className="text-white/40 text-xs mb-3">Escaneie o QR Code ou copie o código abaixo</p>
              <button
                onClick={copyToClipboard}
                className="w-full bg-white/10 text-white p-4 rounded-2xl flex items-center justify-between group active:bg-white/20 transition-colors"
              >
                <span className="truncate text-sm font-mono opacity-60 mr-4">{pixCode}</span>
                {copied ? <CheckCircle2 className="text-live-neon" /> : <Copy size={20} />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-live-neon text-black py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
            >
              Fechar e aguardar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
