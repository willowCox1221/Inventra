import { NavLink, Outlet } from 'react-router-dom';
import BackendStatus from './BackendStatus';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/scan-in', label: 'Scan In' },
  { to: '/scan-out', label: 'Scan Out' },
];

/** App shell: skip link, header with navigation, and the routed page content. */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <span className="text-xl font-bold">Inventra</span>
            <BackendStatus />
          </div>
          <nav aria-label="Main">
            <ul className="flex gap-1">
              {links.map(({ to, label }) => (
                <li key={to} className="flex-1 sm:flex-none">
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `block rounded-md px-4 py-2 text-center text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
