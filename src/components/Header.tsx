import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/courses", label: "Курсы" },
  { href: "/tracking", label: "Мои заявки" },
];

interface HeaderProps {
  transparent?: boolean;
}

const Header = ({ transparent = false }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "bg-card/80 backdrop-blur-2xl border-b border-border/30 shadow-card"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img src={logo} alt="AcademicApply" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform mix-blend-multiply dark:mix-blend-screen" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? transparent
                      ? "bg-card/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                    : transparent
                    ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Кабинет
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
              >
                Войти
              </Link>
              <Link
                to="/assessment?type=school"
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Начать
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg ${transparent ? "text-primary-foreground" : "text-foreground"}`}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card/95 backdrop-blur-2xl border-b border-border/30 px-4 py-4 space-y-2 rounded-b-3xl shadow-card"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-300"
              >
                🏠 Кабинет
              </Link>
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="block w-full text-left px-4 py-3 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-300"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-300"
              >
                Войти
              </Link>
              <Link
                to="/assessment?type=school"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold text-center shadow-md"
              >
                Начать
              </Link>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
