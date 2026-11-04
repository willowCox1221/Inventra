import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you requested doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-blue-700 underline">
        Back to dashboard
      </Link>
    </section>
  );
}
