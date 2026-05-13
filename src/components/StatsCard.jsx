// ============================================================
// src/components/StatsCard.jsx
// Reusable statistic card with icon and gradient accent.
// ============================================================

export default function StatsCard({ title, value, icon: Icon, color = "blue", subtitle }) {
  const colorMap = {
    blue: {
      bg: "from-blue-600/20 to-blue-800/10",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/20",
      icon: "text-blue-400",
      value: "text-blue-300",
    },
    purple: {
      bg: "from-violet-600/20 to-violet-800/10",
      border: "border-violet-500/20",
      iconBg: "bg-violet-500/20",
      icon: "text-violet-400",
      value: "text-violet-300",
    },
    green: {
      bg: "from-emerald-600/20 to-emerald-800/10",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/20",
      icon: "text-emerald-400",
      value: "text-emerald-300",
    },
    orange: {
      bg: "from-orange-600/20 to-orange-800/10",
      border: "border-orange-500/20",
      iconBg: "bg-orange-500/20",
      icon: "text-orange-400",
      value: "text-orange-300",
    },
    red: {
      bg: "from-red-600/20 to-red-800/10",
      border: "border-red-500/20",
      iconBg: "bg-red-500/20",
      icon: "text-red-400",
      value: "text-red-300",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${c.bg} border ${c.border} card-hover`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold font-outfit ${c.value}`}>
            {value ?? "—"}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0 ml-3`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
