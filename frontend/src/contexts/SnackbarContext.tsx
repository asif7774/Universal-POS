import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {throw new Error('useSnackbar must be used within SnackbarProvider');}
  return context;
};

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setSnackbars(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setSnackbars(prev => prev.filter(s => s.id !== id));
    }, 3000);
  }, []);

  const removeSnackbar = (id: string) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div style={{
        position: 'fixed', top: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {snackbars.map(s => (
          <div key={s.id} className={`toast toast-${s.type} animate-slide-up`} style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SvgIcon 
              name={s.type === 'success' ? 'success' : s.type === 'error' ? 'warning' : s.type === 'warning' ? 'warning' : 'info'} 
              width="18" height="18" 
            />
            <span style={{ flex: 1 }}>{s.message}</span>
            <button onClick={() => { removeSnackbar(s.id); }} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};
