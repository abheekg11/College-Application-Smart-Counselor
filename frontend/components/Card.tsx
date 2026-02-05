interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`card p-6 ${className}`} role="region">
      {children}
    </div>
  );
}