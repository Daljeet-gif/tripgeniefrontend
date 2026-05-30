import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navigation() {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const [userName, setUserName] = useState("User");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUserName = async () => {
      if (token) {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUserName(data.user.name);
        } catch (err) {
          console.error("Failed to fetch user name");
        }
      }
    };
    fetchUserName();
  }, [token]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#0d0d0d] border border-white/[0.06] text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d0d] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-[#a87c3e] flex items-center justify-center">
              <span className="text-[#0d0d0d] font-display font-bold text-lg">T</span>
            </div>
            <span className="font-display text-xl text-white">TripGenie</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all ${
              isActive("/") 
                ? "bg-gold/10 text-gold" 
                : "text-white/60 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span className="text-lg">✈️</span>
            New Trip
          </Link>
          
          <Link
            to="/recent-trips"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all ${
              isActive("/recent-trips") 
                ? "bg-gold/10 text-gold" 
                : "text-white/60 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span className="text-lg">📋</span>
            Recent Trips
          </Link>

          
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/[0.06]">
          {token ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
                <span className="text-gold text-sm">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-body truncate">{userName}</p>
                <p className="text-[11px] text-white/40 font-body">Free Plan</p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="block w-full px-4 py-3 rounded-xl text-center text-sm text-white/60 hover:bg-white/[0.04] hover:text-white font-body transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block w-full px-4 py-3 rounded-xl text-center text-sm bg-gold text-[#0d0d0d] font-medium font-body transition-all hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
