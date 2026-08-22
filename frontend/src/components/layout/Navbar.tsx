import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = (): void => { logout(); navigate('/login'); setOpen(false); };
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="bg-blue-950 border-b border-blue-900/50 shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2.5 text-white font-bold text-lg hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 rounded-xl w-9 h-9 flex items-center justify-center text-xl">🚗</div>
            <div className="hidden sm:block">
              <span className="text-white font-extrabold">Car</span>
              <span className="text-blue-400 font-extrabold">Dealership</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  user?.role === 'ADMIN'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {user?.role === 'ADMIN' ? '⚙ ADMIN' : '👤 USER'}
                </span>

                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-blue-100 text-sm font-medium max-w-[8rem] truncate">{user?.name}</span>
                </div>

                {/* Cart button */}
                <button onClick={openCart}
                  className="relative flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors border border-white/10"
                  aria-label="Open cart">
                  🛒
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>

                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-200 hover:text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button onClick={openCart} className="relative text-white p-2" aria-label="Cart">
                🛒
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
            <button className="text-white p-2 rounded-xl hover:bg-white/10" onClick={() => setOpen(p => !p)} aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-blue-900/50 py-3 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl mb-1">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{initials}</div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-blue-400 text-xs">{user?.email}</p>
                  </div>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {user?.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-white text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-white/10 w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-blue-200 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-white/10">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-white text-sm font-semibold px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
