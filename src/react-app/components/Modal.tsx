import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with enhanced blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal with enhanced design */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-white/20">
        {/* Enhanced header with gradient */}
        <div className="relative bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="group p-2 hover:bg-gray-100/70 rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
          </div>
          {/* Decorative line */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
        
        {/* Enhanced content area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
