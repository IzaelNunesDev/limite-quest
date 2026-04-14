/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Eye, Volume2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onReset }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-6 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-b-8 border-v-line"
      >
        <div className="p-6 border-b-2 border-v-line flex justify-between items-center">
          <h3 className="font-black text-2xl text-v-text uppercase tracking-tight">Ajustes</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="text-v-secondary w-6 h-6" />
              <span className="font-bold text-v-text text-lg">Modo Daltônico</span>
            </div>
            <input type="checkbox" className="w-12 h-6 bg-slate-200 rounded-full appearance-none checked:bg-v-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="text-v-secondary w-6 h-6" />
              <span className="font-bold text-v-text text-lg">Leitura de Fórmulas</span>
            </div>
            <input type="checkbox" className="w-12 h-6 bg-slate-200 rounded-full appearance-none checked:bg-v-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform" />
          </div>

          <button 
            onClick={() => {
              if (confirm("Tem certeza que deseja resetar todo o seu progresso?")) {
                onReset();
              }
            }}
            className="v-btn-danger w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Resetar Progresso
          </button>
        </div>
      </motion.div>
    </div>
  );
};
