import { Link } from 'react-router-dom';

/** Fallback page for unknown routes. */
export default function NotFoundPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you requested doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block rounded text-blue-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
        Back to dashboard
      </Link>
    </section>
  );
}
