// components/ui/RiskBadge.jsx — Colored risk level pill

const RISK_STYLES = {
  high: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  medium: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  low: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
};

const RiskBadge = ({ level }) => (
  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${RISK_STYLES[level] || RISK_STYLES.low}`}>
    {level}
  </span>
);

export default RiskBadge;
