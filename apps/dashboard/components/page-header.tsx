import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="page-header__title">{title}</h1>
      </div>
      {children ? <div className="page-header__meta">{children}</div> : null}
    </section>
  );
}

