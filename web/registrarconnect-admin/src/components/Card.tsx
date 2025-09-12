import type { ReactNode } from "react";
import "../styles/components/Card.css";

type Props = { 
  children: ReactNode; 
  title?: ReactNode; 
  className?: string;
};

export default function Card({ children, title, className }: Props) {
  return (
    <div className={`card ${className || ""}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}
