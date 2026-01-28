import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Settings as SettingsIcon, ShoppingCart } from 'lucide-react';
import { Toaster } from 'sonner';
import { ProductSearch } from './components/ProductSearch';
import { StoreComparison } from './components/StoreComparison';
import { Settings } from './components/Settings';
import { ThemeToggle } from './components/ui/ThemeToggle';

function Nav() {
  const loc = useLocation();
  const isSettings = loc.pathname === '/settings';
  const isSearch = loc.pathname === '/';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Shopping PR
              </h1>
              <span className="text-sm">🇵🇷</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSearch
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </Link>
            <Link
              to="/settings"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSettings
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Notion</span>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<ProductSearch />} />
            <Route path="/product/check" element={<StoreComparison />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
            },
            className: 'dark:bg-neutral-900/90 dark:border-neutral-800',
          }}
        />
      </div>
    </BrowserRouter>
  );
}
