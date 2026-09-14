interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: 'var(--spacing-container)',
        margin: '0 auto',
        padding: '0 2rem',
      }}
    >
      {children}
    </div>
  );
}
