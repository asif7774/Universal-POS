import { ReactNode, useEffect } from 'react';
import { SvgIcon } from '../svg-sprite-loader';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 520 }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {onClose();}
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {return null;}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up" style={{ maxWidth }} onClick={e => { e.stopPropagation(); }}>
        <div className="modal-header" style={!title ? { borderBottom: 'none', paddingBottom: 0 } : {}}>
          {title ? (
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>{title}</h3>
          ) : <div />}
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <SvgIcon name="close" width="16" height="16" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
