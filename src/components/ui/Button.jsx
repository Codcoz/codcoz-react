export function Button({ 
  className = '', 
  children, 
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-[#002a45] text-white hover:bg-[#003a5f]',
    outline: 'border border-[#ebebeb] bg-transparent hover:bg-[#ebebeb]',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

