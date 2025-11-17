import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/core/lib/utils';

export const AppLayout = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-blue-600',
      isActive ? 'text-blue-600' : 'text-gray-500'
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="text-xl font-semibold">
            StockBox
          </NavLink>
          <div className="flex items-center gap-6">
            <NavLink to="/" className={linkClass}>
              Estoque
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              Histórico
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-white mt-8 py-4 text-center text-sm text-gray-500 border-t">
        <div className="container mx-auto">
          © {new Date().getFullYear()} StockBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
