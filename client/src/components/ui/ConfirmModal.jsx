import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  variant = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="ghost" 
                onClick={onCancel} 
                className="flex-1 order-2 sm:order-1 border-gray-100"
              >
                {cancelText}
              </Button>
              <Button 
                variant={variant} 
                onClick={onConfirm} 
                className="flex-1 order-1 sm:order-2 shadow-lg"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
