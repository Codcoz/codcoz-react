export function Avatar({ className = '', children }) {
  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', className = '' }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover rounded-full ${className}`}
    />
  );
}

export function AvatarFallback({ className = '', children }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  );
}

