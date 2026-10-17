import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function Arrow() {
  return <ArrowRight size={19} strokeWidth={1.6} aria-hidden="true" />;
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
export function PageHeading({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      <p>{intro}</p>
      {children}
    </div>
  );
}
