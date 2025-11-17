import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Placeholder for a global header or navigation */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">StockBox</h1>
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <Outlet />
      </main>

      {/* Placeholder for a global footer */}
      <footer className="bg-white mt-8 py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          © {new Date().getFullYear()} StockBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
