interface StatCardProps {
  label: string;
  value: number | string;
}

/** A single dashboard statistic. */
export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <dl>
        <dt className="text-sm font-medium text-slate-600">{label}</dt>
        <dd className="mt-2 text-3xl font-bold">{value}</dd>
      </dl>
    </div>
  );
}
