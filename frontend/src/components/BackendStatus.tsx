import { useEffect, useState } from 'react';
import { getHealth } from '../api/client';
import type { HealthStatus } from '../types';

type State = { kind: 'checking' } | { kind: 'online'; mongo: HealthStatus['mongo'] } | { kind: 'offline' };

const DATABASE_LABELS: Record<HealthStatus['mongo'], string> = {
  ok: 'ok',
  not_configured: 'not configured',
  unreachable: 'unreachable',
};

/** Compact indicator of backend connectivity. Checks /api/health once on mount. */
export default function BackendStatus() {
  const [state, setState] = useState<State>({ kind: 'checking' });

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((health) => {
        if (!cancelled) setState({ kind: 'online', mongo: health.mongo });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'offline' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let dot = 'bg-slate-400';
  let text = 'Checking backend…';
  if (state.kind === 'online') {
    const dbOk = state.mongo === 'ok';
    dot = dbOk ? 'bg-green-600' : 'bg-amber-500';
    text = `Backend connected, database ${DATABASE_LABELS[state.mongo] ?? 'unknown'}`;
  } else if (state.kind === 'offline') {
    dot = 'bg-red-600';
    text = 'Backend offline';
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 text-xs font-medium text-slate-700 sm:text-sm"
    >
      <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <span>{text}</span>
    </p>
  );
}
