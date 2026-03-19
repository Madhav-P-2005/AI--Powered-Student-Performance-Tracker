// components/ui/EmptyState.jsx — Reusable "no data" placeholder

import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, subtitle, ctaLabel, ctaLink }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-12 text-center shadow-sm">
    {Icon && (
      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {subtitle && (
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{subtitle}</p>
    )}
    {ctaLabel && ctaLink && (
      <Link
        to={ctaLink}
        className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
      >
        {ctaLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
