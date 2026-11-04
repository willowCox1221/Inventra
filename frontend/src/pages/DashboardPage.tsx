import StatCard from '../components/StatCard';
import type { DashboardStats } from '../types';

// TODO: Replace with data from getDashboardStats() once the API exists.
const placeholderStats: DashboardStats = {
  totalInventory: 0,
  lowStock: 0,
  outOfStock: 0,
};

/** Dashboard with inventory statistics (placeholder data for now). */
export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Inventory" value={placeholderStats.totalInventory} />
        <StatCard label="Low Stock" value={placeholderStats.lowStock} />
        <StatCard label="Out of Stock" value={placeholderStats.outOfStock} />
      </div>
    </section>
  );
}
