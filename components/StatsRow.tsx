const STATS = [
  { value: "20–25", label: "Questions per session" },
  { value: "3", label: "File formats — PDF, DOCX, TXT" },
  { value: "$0", label: "Cost — no account, no API key" },
];

export default function StatsRow() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-4xl font-medium text-paper sm:text-5xl">{stat.value}</p>
            <p className="mt-2 text-sm text-paper/50">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
