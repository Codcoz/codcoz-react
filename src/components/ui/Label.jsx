export function Label({ className = '', children, ...props }) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333333] ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

