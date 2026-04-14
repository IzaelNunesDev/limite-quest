/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 bg-v-secondary text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border-b-4 border-v-secondary-dark"
        >
          <Info className="text-white shrink-0 w-6 h-6" />
          <p className="text-sm font-bold flex-1">{message}</p>
          <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors">OK</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
