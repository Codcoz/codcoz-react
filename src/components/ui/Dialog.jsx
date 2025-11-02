import { useState, createContext, useContext, cloneElement, isValidElement } from 'react';

const DialogContext = createContext(null);

export function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || ((value) => setInternalOpen(value));

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children }) {
  const context = useContext(DialogContext);
  if (!context) return null;
  const { setOpen } = context;
  
  if (asChild && children) {
    if (isValidElement(children)) {
      return cloneElement(children, {
        onClick: (e) => {
          setOpen(true);
          if (children.props.onClick) {
            children.props.onClick(e);
          }
        },
      });
    }
    return (
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
    );
  }
  
  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function DialogContent({ children, className = "" }) {
  const context = useContext(DialogContext);
  if (!context) return null;
  const { open, setOpen } = context;

  if (!open) return null;

  // Extrair max-w do className ou usar padrão
  const hasMaxWidth = className.includes("max-w-");
  const defaultMaxWidth = hasMaxWidth ? "" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className={`relative z-50 w-full ${defaultMaxWidth} bg-white rounded-lg shadow-lg flex flex-col max-h-[90vh] ${className}`}>
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-[#333333]">{children}</h2>;
}

