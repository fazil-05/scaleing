// src/components/ui/Modal.tsx
// Reusable modal with Framer Motion animations

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  closeOnOverlay?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-6xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
  icon,
  closeOnOverlay = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`relative w-full ${sizeClasses[size]} bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-10`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || icon) && (
              <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0 ml-4 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 text-slate-800">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 pb-6 pt-0 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
