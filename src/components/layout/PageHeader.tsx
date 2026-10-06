import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-[#1a2842] mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-mono">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="text-slate-600">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-sky-400 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-300">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
};
